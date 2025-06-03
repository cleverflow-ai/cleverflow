import mcpClientManager from '../mcp/McpClientManager.js';

export async function registerAllMcpClients() {
    const servers = [
        {
            url: process.env.MCP_IO_SERVER_URL,
            name: process.env.MCP_IO_SERVER_NAME,
            version: process.env.MCP_IO_SERVER_VERSION
        },
        {
            url: process.env.MCP_3D_SERVER_URL,
            name: process.env.MCP_3D_SERVER_NAME,
            version: process.env.MCP_3D_SERVER_VERSION
        }
    ];

    for (const s of servers) {
        if (s.url && s.name && s.version) {
            await mcpClientManager.addClient(s.url, s.name, s.version);
        } else {
            console.warn('[MCP] Skipped invalid MCP config:', s);
        }
    }
}
