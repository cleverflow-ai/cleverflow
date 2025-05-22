import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

let client: Client | undefined = undefined;

export async function getClient(serverUrl: string): Promise<Client> {
    if (client) return client;

    client = new Client({
        name: '@cleverflow/cleverflow.mcp.io',
        version: '1.0.0',
    });

    const baseUrl = new URL(serverUrl);
    const transport = new StreamableHTTPClientTransport(baseUrl);

    await client.connect(transport);

    console.log("✅ MCP Client connected (HTTP Streamable)");

    return client;
}
