import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "../../apps/clevernow.mcp.server/src/server.ts"]
});

const client = new Client(
    {
        name: "@cleverflow/cleverflow.mcp.io",
        version: "1.0.0"
    }
);

await client.connect(transport);

// Call a tool
// const result = await client.callTool({
//     name: "calculate-bmi",
//     arguments: {
//         weightKg: 10,
//         heightM: 12,
//     }
// });

// console.log(result);