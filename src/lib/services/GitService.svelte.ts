import { createMcpClient } from "@cleverflow-ai/cleverflow.mcp/dist/McpClient.js";
import { z } from "zod";

export default class GitService {

    mcpClient: any;
    mcpServerUrl: string = $state("http://localhost:3000/mcp");

    url: string = $state("");
    token: string = $state("");
    branch: string = $state("");
    owner: string = $state("");
    repo: string = $state("");
    path: string = $state("");

    async initialize() {
        this.mcpClient = await createMcpClient(
            this.mcpServerUrl,
            "@cleverflow-ao/cleverflow.mcp.io",
            "1.0.0",
        );
    }

    isReady() {
        if (!this.mcpServerUrl || !this.url || !this.token || !this.branch || !this.owner || !this.repo || !this.path) {
            return false;
        }
        return true;
    }

    async getFileContents(): Promise<string> {

        if (!this.mcpClient) {
            await this.initialize();
        }

        const callToolResult = await this.mcpClient.callTool(
            {
                name: "get_file_contents",
                arguments: {
                    url: this.url,
                    token: this.token,
                    branch: this.branch,
                    owner: this.owner,
                    repo: this.repo,
                    path: this.path,
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
    }

    async saveFileContents(fileContent: string): Promise<boolean> {

        if (!this.mcpClient) {
            await this.initialize();
        }

        const callToolResult = await this.mcpClient.callTool(
            {
                name: "update_file_contents",
                arguments: {
                    url: this.url,
                    token: this.token,
                    branch: this.branch,
                    owner: this.owner,
                    repo: this.repo,
                    path: this.path,
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
    }

}