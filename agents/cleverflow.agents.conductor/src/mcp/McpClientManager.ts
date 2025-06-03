
import { createMcpClient } from "@cleverflow-ai/cleverflow.mcp/dist/McpClient.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

type McpClient = {
    serverUrl: string;
    name: string;
    version: string;
    client: Client;
    tools: any[];
};

type McpClientTool = {
    name: string;
}

class McpClientManager {
    private clients: McpClient[];

    constructor() {
        this.clients = [];
    }

    async addClient(serverUrl: string, name: string, version: string): Promise<boolean> {
        if (this.clients.some((c) => c.name === name)) {
            console.log(`MCP client '${name}' already exists`);
            return;
        }
        try {
            const client = await createMcpClient(serverUrl, name, version);
            if (client) {
                const result = await client.listTools();
                this.clients.push({ serverUrl, name, version, client, tools: result.tools });
                console.log(`MCP client '${name}' created successfully at ${serverUrl}`);
                if (!result.tools || result.tools.length === 0) {
                    console.warn(`No tools found for MCP client '${name}' at ${serverUrl}`);
                } else {
                    console.log(`Available tools: ${result.tools.map((tool) => tool.name).join(", ")}`);
                }

                return true;
            }
            console.error(`Failed to create MCP client for ${name} at ${serverUrl}: Client creation returned undefined`);
            return false;
        } catch (error) {
            console.error(`Failed to create MCP client for ${name} at ${serverUrl}:`, error);
            return false;
        }

    }

    async getClient(name: string): Promise<McpClient | undefined> {
        return this.clients.find((c) => c.name === name);
    }

    listTools(): McpClientTool[] {
        return this.clients.flatMap((c) => c.tools.map((tool) => ({ name: tool.name })));
    }

    getClientByToolName(toolName: string): McpClient | undefined {
        return this.clients.find((c) => c.tools.some((tool) => tool.name === toolName));
    }
}

const mcpClientManager = new McpClientManager();

export default mcpClientManager;