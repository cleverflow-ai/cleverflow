import { createMcpClient } from "@cleverflow-ai/cleverflow.mcp/dist/McpClient.js";
import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

export default class McpIO {

    static async createClient(): Promise<Client> {
        return await createMcpClient(
            process.env.MCP_IO_SERVER,
            process.env.MCP_IO_SERVER,
            process.env.MCP_IO_SERVER,
        );
    }

    static async getFileContents(url: string, token: string, branch: string, owner: string, repo: string, path: string): Promise<string> {

        const mcpClient = await McpIO.createClient();

        try {

            const callToolResult = await mcpClient.callTool(
                {
                    name: "get_file_contents",
                    arguments: {
                        url,
                        token,
                        branch,
                        owner,
                        repo,
                        path,
                    },
                },
                z.any(),
                {
                    timeout: 3600 * 1000,
                },
            );

            if (callToolResult.error) {
                throw new Error(callToolResult.error.message ?? "Unknown error");
            }

            const content =
                callToolResult.content &&
                    Array.isArray(callToolResult.content) &&
                    callToolResult.content.length > 0
                    ? callToolResult.content[0]
                    : null;


            return content?.text;

        } finally {
            mcpClient?.close();
        }
    }

    static async saveFileContents(url: string, token: string, branch: string, owner: string, repo: string, path: string, fileContent: string,): Promise<boolean> {

        const mcpClient = await McpIO.createClient();

        console.log(`>>>> path: ${path}`);
        try {

            const callToolResult = await mcpClient.callTool(
                {
                    name: "save_file_contents",
                    arguments: {
                        url,
                        token,
                        branch,
                        owner,
                        repo,
                        path,
                        content: fileContent,
                    },
                },
                z.any(),
                {
                    timeout: 3600 * 1000,
                },
            );

            if (callToolResult.error) {
                throw new Error(callToolResult.error.message ?? "Unknown error");
            }

            const content =
                callToolResult.content &&
                    Array.isArray(callToolResult.content) &&
                    callToolResult.content.length > 0
                    ? callToolResult.content[0]
                    : null;

            console.log(content);

            return !content?.isError;

        } finally {
            mcpClient?.close();
        }
    }

}