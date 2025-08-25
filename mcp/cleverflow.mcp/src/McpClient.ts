import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { LoggingMessageNotificationSchema } from "@modelcontextprotocol/sdk/types.js";

export type McpClientOptions = Partial<{
    mcpSessionId: string;
    token: string;
}>

export async function createMcpClient(
    serverUrl: string,
    name: string,
    version: string,
    options: McpClientOptions = {
        mcpSessionId: null,
        token: null
    })
    : Promise<Client> {
    // Create a new MCP client instance
    const client = new Client({
        name: name,
        version: version,
    });

    // Use the real MCP schema with correct typing
    client.setNotificationHandler<typeof LoggingMessageNotificationSchema>(
        LoggingMessageNotificationSchema,
        (notification) => {
            const { level, logger, data } = notification.params;
            console.log(`[${level} | ${logger ? `${logger}` : "no dedicated logger"}]: `, data ? JSON.stringify(data) : "");
        }
    );

    // Setup the transport i.e. Streamable HTTP for the MCP client
    const baseUrl = new URL(serverUrl);
    
    let headers = {};
    if (options.mcpSessionId) {
        headers['mcp-session-id'] = options.mcpSessionId;
    }
    if (options.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
    }
    
    const transport = new StreamableHTTPClientTransport(baseUrl, {
        requestInit: {
            headers: headers
        }
    });
    await client.connect(transport);

    console.log("✅ MCP Client connected (Streamable HTTP)");

    return client;
}