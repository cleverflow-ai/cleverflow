import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { v4 as uuidv4 } from 'uuid';
import z from "zod";

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

    // Enable Notifications 
    const notificationSchema = z.object({
        method: z.literal("notifications/message"),
        params: z.object({
            level: z.string(),
            message: z.string()
        }).optional()
    });
    client.setNotificationHandler(notificationSchema, (notification) => {
        console.log("Received notification:", notification);
    });

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