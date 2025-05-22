import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import McpHost from "@cleverflow-ai/cleverflow.mcp/dist/McpHost.js";
import ExpressMcpHost from "@cleverflow-ai/cleverflow.mcp/dist/ExpressMcpHost.js";
import { z } from "zod";

const host: McpHost = new ExpressMcpHost('/mcp', 3000, 'stateful', () => {
    const server = new McpServer({
        name: "@cleverflow/cleverflow.mcp.io",
        version: "1.0.0"
    });

    // ... set up server resources, tools, and prompts ...
    // Simple tool with parameters
    // See also: https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file#tools


    server.tool(
        "calculate-bmi",
        {
            weightKg: z.number(),
            heightM: z.number()
        },
        async ({ weightKg, heightM }) => ({
            content: [{
                type: "text",
                text: String(weightKg / (heightM * heightM))
            }]
        })
    );

    return server;
});

await host.start();

process.on("SIGINT", async () => {
    await host.stop();
});
process.on("SIGTERM", async () => {
    await host.stop();
});