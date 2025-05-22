import McpHost from "@cleverflow-ai/cleverflow.mcp/dist/McpHost.js";
import ExpressMcpHost from "@cleverflow-ai/cleverflow.mcp/dist/ExpressMcpHost.js";
import { createServer } from "./server.js";

const host: McpHost = new ExpressMcpHost("/mcp", 3000, "stateful", createServer);

await host.start();

process.on("SIGINT", async () => await host.stop());
process.on("SIGTERM", async () => await host.stop());
