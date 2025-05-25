import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import Outline from "./resources/Outline.js";
import z from "zod";

export function createServer() {
    const server = new McpServer({
        name: "@cleverflow/cleverflow.mcp.io",
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
            fileId: z.string(),
            baseUrl: z.string(),
            apiKey: z.string()
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
}