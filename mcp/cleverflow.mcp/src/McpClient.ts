import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { v4 as uuidv4 } from 'uuid';
import z from "zod";

export async function createMcpClient(serverUrl: string, name: string, version: string, token: string): Promise<Client> {
    const client = new Client({
        name: name,
        version: version,
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
                'mcp-session-id': uuidv4(),
                'sessionId': uuidv4(),
                Authorization: `Bearer ${token}`,
            }
        }
    });

    await client.connect(transport);

    console.log("✅ MCP Client connected (HTTP Streamable)");

    return client;
}