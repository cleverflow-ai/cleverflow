import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { z } from "zod";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import path from 'path';
import _ from 'lodash';

export default class Github {

    static McpServerUrl = "https://api.githubcopilot.com/mcp/";

    private client: Client;

    constructor(private token: string) { }

    private async createClient() {
        if (!this.client) {
            console.log('>>> create mcp client: token ', this.token);
            this.client = await this.createMcpClient(
                Github.McpServerUrl,
                '@copilot/github',
                '1.0.0',
                this.token,
            );
        }
    }

    public async fetch(branch: string, owner: string, repo: string, path: string): Promise<any> {

        const isFile = this.isPathFile(path);
        if (!isFile && !path.endsWith('/')) {
            path = `${path}/`;
        }

        await this.createClient();

        const callToolResult = await this.client.callTool(
            {
                name: "get_file_contents",
                arguments: {
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

        console.log('>>>>>> callToolResult');
        console.log(JSON.stringify(callToolResult));

        const content =
            callToolResult.content &&
                Array.isArray(callToolResult.content) &&
                callToolResult.content.length > 0
                ? callToolResult.content
                : null;

        if (!content) {
            return null;
        }

        if (isFile) {
            const resourceContent = _.find(content, (item) => {
                return item.type === 'resource' && item.resource;
            });
            return resourceContent?.resource?.text;
        } else {
            const textContent = _.find(content, (item) => {
                return item.type === 'text';
            });

            if (textContent && textContent.text) {
                try {
                    return JSON.parse(textContent.text);
                    // const list = JSON.parse(textContent.text);
                    // return list.map((item: any) => ({
                    //     id: item.sha,
                    //     name: item.name,
                    //     type: item.type,
                    //     path: item.path,
                    // }));
                } catch (exception) {
                    console.log(exception);
                    return exception.message ?? 'Exception: cannot parsing an invalid array text';
                }
            }
        }
        return null;
    }

    // TODO: how to get a file SHA for updating
    public async createOrUpdateFile(branch: string, owner: string, repo: string, path: string, fileContent: string, message: string | null): Promise<any> {

        const isFile = this.isPathFile(path);
        if (!isFile) {
            return;
        }

        await this.createClient();

        const callToolResult = await this.client.callTool(
            {
                name: "create_or_update_file",
                arguments: {
                    branch,
                    owner,
                    repo,
                    path,
                    content: fileContent,
                    message: message ?? 'Not given',
                },
            },
            z.any(),
            {
                timeout: 3600 * 1000,
            },
        );

        const content =
            callToolResult.content &&
                Array.isArray(callToolResult.content) &&
                callToolResult.content.length > 0
                ? callToolResult.content
                : null;

        if (!content) {
            return false;
        }
        return true;
    }

    private async createMcpClient(serverUrl: string, name: string, version: string, token: string): Promise<Client> {
        const client = new Client({
            name: name,
            version: version,
        });

        const notificationSchema = z.object({
            method: z.literal("notifications/message"),
            params: z.object({
                level: z.string(),
                message: z.string()
            }).optional()
        });

        client.setNotificationHandler(notificationSchema, (notification) => {
            console.log("Received notification:", notification);
        });

        const baseUrl = new URL(serverUrl);
        const transport = new StreamableHTTPClientTransport(baseUrl, {
            requestInit: {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        });

        await client.connect(transport);

        console.log("✅ MCP Client connected (HTTP Streamable)");

        return client;
    }

    private isPathFile(p: string): boolean {
        // Loại bỏ dấu slash cuối nếu có
        const cleanPath = p.replace(/\/+$/, '');
        const ext = path.extname(cleanPath);
        return !!ext;
    }
}
