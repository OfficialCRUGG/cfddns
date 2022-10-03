<div align="center">

# cfddns (cloudflare-dyndns)

![Lines of code](https://img.shields.io/tokei/lines/github/OfficialCRUGG/cfddns?style=for-the-badge)
![npm Downloads](https://img.shields.io/npm/dy/cloudflare-dyndns?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/OfficialCRUGG/cfddns?style=for-the-badge)
![GitHub pull requests](https://img.shields.io/github/issues-pr/OfficialCRUGG/cfddns?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/OfficialCRUGG/cfddns?style=for-the-badge)
![GitHub Repo stars](https://img.shields.io/github/stars/OfficialCRUGG/cfddns?style=for-the-badge)
![npm Version](https://img.shields.io/npm/v/cloudflare-dyndns?style=for-the-badge)
![GitHub contributors](https://img.shields.io/github/contributors/OfficialCRUGG/cfddns?style=for-the-badge)

</div>

☁️ Automatic Cloudflare DNS updater for dynamic IP addresses

## Requirements

-   Node.js
-   yarn (recommended) or npm
-   Cloudflare account

## Installation

```bash
yarn global add cloudflare-dyndns
# or
npm i -g cloudflare-dyndns
```

## Before starting

Before you start, make sure you have the following ready:

-   Cloudflare Zone ID of your domain (read how to find it [here](https://developers.cloudflare.com/fundamentals/get-started/basic-tasks/find-account-and-zone-ids/#:~:text=To%20find%20your%20zone%20and,Zone%20ID%20and%20Account%20ID.))
-   Cloudflare API Token (read how to create it [here](https://developers.cloudflare.com/api/tokens/create))
    -   Create it [here](https://dash.cloudflare.com/profile/api-tokens)
    -   The token should have the following permission(s) on the zone you want to update:
        -   Zone:DNS:Edit

## Usage

```bash
cfddns # Starts the tool, will guide you through configuration on first run
cfddns --help # Shows help
```

## Help

```
Usage: cfddns [options]

A CLI tool for automatically updating Cloudflare DNS records

Options:
  -V, --version             output the version number
  -c, --config              Force the config wizard to run even when config file is present
  -o, --once                Run the updater only once and then exit
  -w, --webserver           Force the web server to run even when disabled in config
  -dw, --disable-webserver  Force the web server to not run even when enabled in config
  -npw, --no-password       Make the webserver run passwordless
  -h, --help                Show this help message
  -d, --debug               Enable debug logging
```

## How to report issues/questions

-   For general issues/questions, [open an issue](https://github.com/OfficialCRUGG/cfddns/issues)

## License

As this is an open-source project, support is limited. Please use [GitHub Issues](https://github.com/OfficialCRUGG/cfddns/issues) for support

**ℹ️ All code in this repository is licensed under the [MIT License](LICENSE.md).**
