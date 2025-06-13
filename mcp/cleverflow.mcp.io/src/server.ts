import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import Outline from "./resources/Outline.js";
import Gitea from "./resources/Gitea.js";
import z from "zod";

export function createServer() {
    const server = new McpServer({
        name: "@cleverflow-ai/cleverflow.mcp.io",
        version: "1.0.0"
    }, {
        capabilities: {
            logging: {

            }
        }
    });
    console.log("MCP Server created");

    registerResources(server);
    registerTools(server);

    return server;
}

function registerResources(server: McpServer) {
    server.resource(
        "echo",
        "echo://helloWorld",
        async (uri, { }) => (
            {
                contents: [
                    {
                        uri: uri.href,
                        text: 'Hello world!'
                    }
                ],
            }
        )
    );
    console.log("Echo resource registered");

    // server.resource(
    //     "outline",
    //     new ResourceTemplate("outline://{fileId}", { list: undefined }),
    //     async (uri, { fileId }, extra) => {
    //         // const outline = new Outline(baseUrl as string, apiKey as string);
    //         // const text = await outline.fetch(fileId as string);
    //         console.log(uri);

    //         return {
    //             contents: [
    //                 {
    //                     uri: uri.href,
    //                     text: "Test"
    //                 }
    //             ],
    //         };
    //     }
    // );
    // console.log("Outline resource registered");
}

function registerTools(server: McpServer) {

    server.tool(
        "fetch-outline-text-file",
        {
            baseUrl: z.string(),
            apiKey: z.string(),
            fileId: z.string(),
        },
        async ({ fileId, baseUrl, apiKey }, extra) => {
            await extra.sendNotification({
                method: "notifications/message",
                params: {
                    level: "info",
                    message: "Fetching outline file content...",
                }
            });

            const outline = new Outline(baseUrl, apiKey);
            const text = await outline.fetch(fileId);

            return {
                content: [
                    {
                        type: "text",
                        text: text
                    }
                ],
            };
        }
    );

    server.tool(
        "fetch-gitea-text-file",
        {
            baseUrl: z.string(),
            apiKey: z.string(),
            repoOwner: z.string(),
            repo: z.string(),
            filePath: z.string(),
        },
        async ({ repoOwner, repo, filePath, baseUrl, apiKey }, extra) => {
            await extra.sendNotification({
                method: "notifications/message",
                params: {
                    level: "info",
                    message: "Fetching gitea file content...",
                }
            });

            const gitea = new Gitea(baseUrl, apiKey);
            const text = await gitea.fetch(repoOwner, repo, filePath);
            console.log(`>>>> text: ${text}`);
            return {
                content: [
                    {
                        type: "text",
                        text: text
                    }
                ],
            };
        }
    );
}