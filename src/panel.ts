import { Logger } from "@blazingworks/logger";
import Fastify from "fastify";

export function startPanel(logger: Logger, port: number) {
    const app = Fastify();
    app.get("/", (request, reply) => {
        reply.type("text/html").send(`
            <html>
                <head>
                    <title>OfficialCRUGG/cfddns</title>
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap" rel="stylesheet">
                    <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            overflow: hidden;
                        }
                        #wrapper {
                            width: 100%;
                            height: 100vh;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            background-color: #FFCFBF;
                            color: black;
                            transition-duration: 250ms;
                            overflow: hidden;
                        }
                        h1 {
                            margin: 0;
                            font-family: bold;
                            font-size: 3em;
                            text-align: center;
                            font-family: "Poppins", sans-serif;
                            padding: 20px;
                        }
                        a {
                            color: inherit;
                            text-decoration: underline;
                            transition-duration: 250ms;
                        }
                        #wrapper.hover {
                            background-color: #FF6633!important;
                            color: rgba(255, 255, 255, 0.5)!important;
                        }
                        #wrapper.hover a {
                            color: white;
                        }
                    </style>
                </head>
                <body>
                    <div id="wrapper">
                        <h1>Running <a href="https://github.com/OfficialCRUGG/cfddns">cfddns</a> by OfficialCRUGG. The panel will receive functionality in a future version.</h1>
                    </div>
                    <script>
                        const wrapper = document.getElementById("wrapper");
                        const link = document.querySelector("a");
                        link.addEventListener("mouseover", () => {
                            wrapper.classList.add("hover");
                        });
                        link.addEventListener("mouseout", () => {
                            wrapper.classList.remove("hover");
                        });
                    </script>
                </body>
            </html>
        `);
    });

    app.listen({ port }, (err, address) => {
        if (err) throw err;
        logger.info(`Panel listening on ${address}`);
    });
}
