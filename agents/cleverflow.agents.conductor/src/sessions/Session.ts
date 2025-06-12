import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createMcpClient } from "@cleverflow-ai/cleverflow.mcp/dist/McpClient.js";
import { BFlowNodeTool } from "../baml_client";

type McpClientForSession = {
    serverUrl: string;
    name: string;
    version: string;
    description: string;
    client: Client;
    tools: any[];
};


export default class Session {
    id: string;
    mcpClients: McpClientForSession[] = [];

    constructor(sessionId: string) {
        this.id = sessionId;
    }

    async addClient(serverUrl: string, name: string, version: string, description: string): Promise<boolean> {

        try {
            const client = await createMcpClient(serverUrl, name, version);
            if (client) {
                const result = await client.listTools();
                this.mcpClients.push({ serverUrl, name, description, version, client, tools: result.tools });
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

    getMcpClientTools(): BFlowNodeTool[] {
        return this.mcpClients.flatMap((c) => c.tools.map((tool) => ({
            name: tool.name,
            description: `Tool ${tool.name} from MCP client`,
            inputSchema: {
                required: tool.inputSchema?.required ?? []
            }
        })));
    }

    getClientByToolName(toolName: string): McpClientForSession | null {
        return this.mcpClients.find((c) => c.tools.some((tool) => tool.name === toolName));
    }
}