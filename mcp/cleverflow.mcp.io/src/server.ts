import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import Outline from "./resources/Outline.js";
import z from "zod";

export function createServer() {
    const server = new McpServer({
        name: "@cleverflow/cleverflow.mcp.io",
        version: "1.0.0"
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

    server.resource(
        "outline",
        "outline://textFile",
        // new ResourceTemplate("outline://{fileId}", { list: undefined }),
        async (uri, extra) => {
            const params = uri.searchParams;
            const fileId = params.get("fileId");
            const baseUrl = params.get("baseUrl");
            const apiKey = params.get("apiKey");

            const outline = new Outline(baseUrl, apiKey);
            const text = await outline.fetch(fileId);

            return {
                contents: [
                    {
                        uri: uri.href,
                        text: text
                    }
                ],
            };
        } 
    );
    console.log("Outline resource registered");
}

function registerTools(server: McpServer) {
    server.tool(
        "fetch-outline-text-file",
        {
            fileId: z.string(),
            baseUrl: z.string(),
            apiKey: z.string()
        },
        async ({ fileId, baseUrl, apiKey }) => {
            const outline = new Outline(baseUrl, apiKey);
            const text = await outline.fetch(fileId);

            return {
                contents: [
                    {
                        type: "text",
                        text: text
                    }
                ],
            };
        } 
    );
}