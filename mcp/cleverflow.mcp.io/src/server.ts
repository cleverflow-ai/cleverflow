import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCalculateBmiTool } from "./tools/index.js";

export function createServer() {
    const server = new McpServer({
        name: "@cleverflow/cleverflow.mcp.io",
        version: "1.0.0"
    });

    registerCalculateBmiTool(server);

    return server;
}
