import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
    registerCalculateBmiTool,
    registerReadOutlineFileTool,
} from "./tools/index.js";

function registerTool(server: McpServer) {
    registerCalculateBmiTool(server);
    registerReadOutlineFileTool(server);
}

export function createServer() {
    const server = new McpServer({
        name: "@cleverflow/cleverflow.mcp.io",
        version: "1.0.0"
    });

    registerTool(server);

    return server;
}
