import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getOutlineFileContent } from "@cleverflow/cleverflow.outline";

import dotenvFlow from 'dotenv-flow';
import dotenvExpand from 'dotenv-expand';
dotenvExpand.expand(dotenvFlow.config())

const serverUrl = process.env.OUTLINE_SERVER_URL;
const apiKey = process.env.OUTLINE_API_KEY;

export function registerReadOutlineFileTool(server: McpServer) {
    server.tool(
        "read-outline-file",
        {
            fileId: z.string()
        },
        async ({ fileId }) => {
            const content = await getOutlineFileContent({
                url: `${serverUrl}/api/documents.info`,
                apiKey,
                fileId
            });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(content)
                }]
            };
        }
    );
}
