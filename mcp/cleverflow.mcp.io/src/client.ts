import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { v4 as uuidv4 } from 'uuid';
import z from "zod";

let client: Client | undefined = undefined;

export async function createClient(serverUrl: string): Promise<Client> {
    if (client) return client;

    client = new Client({
        name: '@cleverflow/cleverflow.mcp.io',
        version: '1.0.0',
    });

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

    const baseUrl = new URL(serverUrl);
    const transport = new StreamableHTTPClientTransport(baseUrl, {
        requestInit: {
            headers: {  
                'mcp-session-id': uuidv4()
            }
        }
    });

    await client.connect(transport);

    console.log("✅ MCP Client connected (HTTP Streamable)");

    return client;
}