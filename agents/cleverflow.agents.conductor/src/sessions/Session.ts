import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createMcpClient } from "@cleverflow-ai/cleverflow.mcp/dist/McpClient.js";
import { BFlowNodeTool } from "../baml_client";
import GitFileReference from "./GitFileReference.js";

type McpTool = {
    name: string,
    description: string,
    inputSchema: any,
}

type McpResource = {
    uri: string,
    name: string,
    description: string,
}


type McpClientForSession = {
    serverUrl: string;
    name: string;
    version: string;
    description: string;
    client: Client;
    tools: McpTool[];
    resources: McpResource[],
};


export default class Session {
    id: string;
    mcpClients: McpClientForSession[] = [];
    gitFileReference: GitFileReference | null;

    constructor(sessionId: string) {
        this.id = sessionId;
    }

    getId(): string {
        return this.id;
    }

    async registerMcpClient(serverUrl: string, name: string, version: string, description: string): Promise<boolean> {

        try {
            const client = await createMcpClient(serverUrl, name, version);
            if (client) {
                const results = await Promise.all([
                    client.listTools(),
                    // client.listResources(),
                ]);
                const listToolsResult = results[0];
                // const listResourcesResult = results[1];

                console.log(`>>>> add client`);

                console.log(JSON.stringify(listToolsResult));
                // console.log(JSON.stringify(listResourcesResult))

                this.mcpClients.push({
                    serverUrl,
                    name,
                    description,
                    version,
                    client,
                    tools: listToolsResult.tools,
                    // resources: listResourcesResult.resources
                    resources: []
                });

                console.log(`MCP client '${name}' created successfully at ${serverUrl}`);
                if (!listToolsResult.tools || listToolsResult.tools.length === 0) {
                    console.warn(`No tools found for MCP client '${name}' at ${serverUrl}`);
                } else {
                    console.log(`Available tools: ${listToolsResult.tools.map((tool) => tool.name).join(", ")}`);
                }

                // if (!listResourcesResult.resources || listResourcesResult.resources.length === 0) {
                //     console.warn(`No reources found for MCP client '${name}' at ${serverUrl}`);
                // } else {
                //     console.log(`Available resources: ${listResourcesResult.resources.map((resource) => resource.name).join(", ")}`);
                // }

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

    clearMcpClients() {
        this.mcpClients = [];
    }

    setGitFileReference(gitFileReference: GitFileReference) {
        this.gitFileReference = gitFileReference;
    }

    getGitFileReference(): GitFileReference {
        return this.gitFileReference;
    }

}