import { createMcpClient } from "@cleverflow-ai/cleverflow.mcp/dist/McpClient.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CompatibilityCallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";

export default class McpIO {

    static async createClient(): Promise<Client> {
        return await createMcpClient(
            process.env.MCP_IO_SERVER,
            process.env.MCP_IO_NAME,
            process.env.MCP_IO_VERSION,
        );
    }

    static async getFileContents(url: string, token: string, branch: string, owner: string, repo: string, path: string): Promise<any> {

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
                CompatibilityCallToolResultSchema,
                {
                    timeout: 3600 * 1000,
                },
            );

            if (callToolResult.error) {
                throw new Error((callToolResult.error as { message?: string })?.message ?? "Unknown error");
            }

            const content =
                callToolResult.content &&
                    Array.isArray(callToolResult.content) &&
                    callToolResult.content.length > 0
                    ? callToolResult.content[0]
                    : null;

            return content;

        } catch (exception: any) {
            console.error(exception);
            return null;
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
                CompatibilityCallToolResultSchema,
                {
                    timeout: 3600 * 1000,
                },
            );

            if (callToolResult.error) {
                throw new Error((callToolResult.error as { message?: string })?.message ?? "Unknown error");
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

    static async runJSCode(jsCode: string, input: any): Promise<any> {

        const mcpClient = await McpIO.createClient();

        try {

            const callToolResult = await mcpClient.callTool(
                {
                    name: "execute_js",
                    arguments: {
                        jsCode,
                        input,
                    },
                },
                CompatibilityCallToolResultSchema,
                {
                    timeout: 3600 * 1000,
                },
            );

            if (callToolResult.error) {
                throw new Error((callToolResult.error as { message?: string })?.message ?? "Unknown error");
            }

            const content =
                callToolResult.content &&
                    Array.isArray(callToolResult.content) &&
                    callToolResult.content.length > 0
                    ? callToolResult.content[0]
                    : null;

            console.log(content);

            return content;

        } finally {
            mcpClient?.close();
        }
    }

}