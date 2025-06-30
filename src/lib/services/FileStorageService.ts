import type Session from "$lib/session/Session.svelte";
import { createMcpClient } from "@cleverflow-ai/cleverflow.mcp/dist/McpClient.js";
import { z } from "zod";

export default class FileStorageService {

    static async getFileContents(session: Session): Promise<string> {

        let mcpClient;

        try {
            mcpClient = await createMcpClient(
                session.mcpServerUrl,
                "@cleverflow-ao/cleverflow.mcp.io",
                "1.0.0",
            );

            const callToolResult = await mcpClient.callTool(
                {
                    name: "get_file_contents",
                    arguments: {
                        url: session.url,
                        token: session.token,
                        branch: session.branch,
                        owner: session.owner,
                        repo: session.repo,
                        path: session.path,
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


            const binary = atob(content.data?.base64FileContent);
            const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
            return new TextDecoder('utf-8').decode(bytes);

        } finally {
            mcpClient?.close();
        }
    }

    static async saveFileContents(session: Session, fileContent: string,): Promise<boolean> {

        let mcpClient;

        try {

            mcpClient = await createMcpClient(
                session.mcpServerUrl,
                "@cleverflow-ao/cleverflow.mcp.io",
                "1.0.0",
            );

            const callToolResult = await mcpClient.callTool(
                {
                    name: "save_file_contents",
                    arguments: {
                        url: session.url,
                        token: session.token,
                        branch: session.branch,
                        owner: session.owner,
                        repo: session.repo,
                        path: session.path,
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