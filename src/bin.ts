#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from "@blazingworks/logger";
import PrettyConsoleTransport from "@blazingworks/logger-transport-prettyconsole";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import inquirer from "inquirer";
import { program } from "commander";
import toml from "toml";
import configTemplate from "./configTemplate";
import axios from "axios";
import Cloudflare from "cloudflare";
import { LogLevel } from "@blazingworks/logger/enums";
import { startPanel } from "./panel";

const configPath = path.join(os.homedir(), ".cfddns.toml");
const ipCachePath = path.join(os.homedir(), ".cfddns.ip");

let ipCache = "";
let nextRun: undefined | Date = undefined;
let runInProgress = false;

program
    .name("cfddns")
    // read version from package.json
    .version(JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf-8")).version || "0.0.0")
    .description("A CLI tool for automatically updating Cloudflare DNS records")
    .option("-c, --config", "Force the config wizard to run even when config file is present")
    .option("-o, --once", "Run the updater only once and then exit")
    .option("-w, --webserver", "Force the web server to run even when disabled in config")
    // .option("-p, --port <port>", "Specify the port to run the web server on")
    .option("-dw, --disable-webserver", "Force the web server to not run even when enabled in config")
    // .option("-pw, --password <password>", "Specify the password to use for the web server")
    .option("-npw, --no-password", "Make the webserver run passwordless")
    .option("-h, --help", "Show this help message")
    .option("-d, --debug", "Enable debug logging");

program.parse();

const options = program.opts();

const logLevels = [LogLevel.Access, LogLevel.Error, LogLevel.Info, LogLevel.Warn, LogLevel.Fatal];

if (options.debug) {
    logLevels.push(LogLevel.Debug);
}

const logger = new Logger({
    transports: [{ module: new PrettyConsoleTransport(), levels: logLevels }],
});

if (options.help) {
    program.help();
} else {
    const configExists = fs.existsSync(configPath);
    const shouldRunConfigWizard = options.config || !configExists;
    if (shouldRunConfigWizard) {
        configWizard(configExists);
    } else {
        start();
    }
}

function configWizard(configExists: boolean) {
    inquirer
        .prompt([
            {
                type: "confirm",
                name: "confirmation",
                message: configExists
                    ? `There is already a config file present at ${configPath}. Do you wish to continue and overwrite it?`
                    : `By proceeding, this wizard will create a config file at ${configPath}. Do you want to proceed?`,
            },
            {
                type: "password",
                name: "cloudflareApiToken",
                message: "What is your Cloudflare API token? (Must have DNS:Write permissions for your desired zone)",
                when: (answers) => answers.confirmation,
            },
            {
                type: "input",
                name: "cloudflareZoneId",
                message: "What is your Cloudflare zone ID?",
                when: (answers) => answers.confirmation,
            },
            {
                type: "input",
                name: "cloudflareDomains",
                message: "Which domains do you want to update? (Seperated by commas without spaces; e.g. example.com,example.org)",
                when: (answers) => answers.confirmation,
            },
            {
                type: "list",
                name: "updateFrequency",
                message: "How often do you want to check for IP changes?",
                choices: ["5 minutes", "15 minutes", "30 minutes", "1 hour", "4 hours", "8 hours", "12 hours"],
                when: (answers) => answers.confirmation,
            },
            /*
            {
                type: "confirm",
                name: "panel",
                message: "Do you want to enable the web panel?",
                when: (answers) => answers.confirmation,
            },
            {
                type: "number",
                name: "panelPort",
                message: "What port do you want to run the web panel on?",
                default: 7887,
                when: (answers) => answers.confirmation && answers.panel,
            },
            {
                type: "password",
                name: "panelPassword",
                message: "What password do you want to use for the web panel? (This will be saved in plain text on your computer)",
                when: (answers) => answers.confirmation && answers.panel,
            },
            */
        ])
        .then((answers) => {
            if (!answers.confirmation) process.exit(0);
            const updateFrequencies: any = {
                "5 minutes": 5,
                "15 minutes": 15,
                "30 minutes": 30,
                "1 hour": 60,
                "4 hours": 240,
                "8 hours": 480,
                "12 hours": 720,
            };
            const config = configTemplate
                .replace("{{update_frequency}}", updateFrequencies[answers.updateFrequency])
                .replace("{{cloudflare_api_token}}", answers.cloudflareApiToken)
                .replace("{{cloudflare_zone_id}}", answers.cloudflareZoneId)
                .replace("{{cloudflare_domains}}", JSON.stringify(answers.cloudflareDomains.split(",")))
                .replace("{{panel_enabled}}", answers.panel ? "true" : "false" || "false")
                .replace("{{panel_port}}", answers.panelPort || 7887)
                .replace("{{panel_password}}", answers.panelPassword || "changeme");
            fs.writeFileSync(configPath, config);
            start();
        })
        .catch((error) => {
            throw error;
        });
}

async function start() {
    const config = toml.parse(fs.readFileSync(configPath, "utf-8"));

    // Check IP cache
    if (fs.existsSync(ipCachePath)) {
        ipCache = fs.readFileSync(ipCachePath, "utf-8");
    }

    const cf = new Cloudflare({
        token: config.cloudflare.account.api_token,
    });

    // Panel
    if ((config.panel.enabled && !options.disableWebserver) || options.webserver) {
        startPanel(logger, config.panel.port);
    }

    await updateDns(cf, config);
}

async function updateDns(cf: Cloudflare, config: any) {
    if (runInProgress) return;
    runInProgress = true;
    const ip = (await axios.get("https://checkip.amazonaws.com/")).data;
    if (ipCache !== ip) {
        logger.info(`IP changed from ${ipCache} to ${ip}`);
        ipCache = ip;
        fs.writeFileSync(ipCachePath, ipCache);
        const dnsRecords: any = await cf.dnsRecords.browse(config.cloudflare.zone.zone_id);
        // find the dns records that match the domains in the config:
        const domainsToUpdate = config.cloudflare.domains.domains;

        // loop through the domains
        domainsToUpdate.forEach(async (domain: string) => {
            // check if record exists
            const record = dnsRecords.result.find((record: any) => record.name === domain);
            if (record) {
                logger.debug(`Updating DNS record for ${domain} to ${ip}`);
                // update record
                await cf.dnsRecords.edit(config.cloudflare.zone.zone_id, record.id, {
                    type: "A",
                    name: domain,
                    content: ip,
                    ttl: 1,
                });
                logger.info(`Updated ${domain} to ${ip}`);
            } else {
                logger.debug(`Creating DNS record for ${domain} to ${ip}`);
                // create record
                await cf.dnsRecords.add(config.cloudflare.zone.zone_id, {
                    type: "A",
                    name: domain,
                    content: ip,
                    ttl: 1,
                });
                logger.info(`Created ${domain} to ${ip}`);
            }
        });

        runInProgress = false;
        if (!options.once) {
            scheduleNextRun(cf, config);
        }
    } else {
        logger.info("IP hasn't changed, not doing anything this run.");
        runInProgress = false;
        if (!options.once) {
            scheduleNextRun(cf, config);
        }
    }
}

function scheduleNextRun(cf: Cloudflare, config: any) {
    nextRun = new Date();
    nextRun.setMinutes(nextRun.getMinutes() + config.update_frequency);
    setTimeout(updateDns, config.update_frequency * 60 * 1000, cf, config);
    logger.info(`Next run scheduled for ${nextRun}`);
}
