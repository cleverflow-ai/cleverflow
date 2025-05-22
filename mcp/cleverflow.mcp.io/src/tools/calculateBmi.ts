import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerCalculateBmiTool(server: McpServer) {
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
}
