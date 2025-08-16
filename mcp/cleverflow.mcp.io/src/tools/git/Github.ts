import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { LoggingMessageNotificationSchema, CompatibilityCallToolResultSchema, } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import * as p from 'path';
import _ from 'lodash';
import Git from "./Git.js";
import { Content } from "../Content.js";
import GitFile from "./GitFile.js";

export default class Github extends Git {

    static readonly McpServerUrl = "https://api.githubcopilot.com/mcp/";

    private client: Client;

    constructor(url: string, token: string) {
        super(url, token);
    }

    private async createClient() {
        if (!this.client) {
            console.log('>>>  create Github mcp client: token ', this.token);
            this.client = await this.createMcpClient(
                this.url,
                '@copilot/github',
                '1.0.0',
                this.token,
            );
        }
    }


    public async fetchFileContent(branch: string, owner: string, repo: string, path: string): Promise<Content | Array<GitFile> | null> {
        if (path.startsWith('/')) {
            path = path.slice(1);
        }

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
                }
            },
            CompatibilityCallToolResultSchema,
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
                } catch (exception) {
                    console.log(exception);
                    return exception.message ?? 'Exception: cannot parse an invalid array text.';
                }
            }
        }
        return null;
    }

    public async saveFileContent(branch: string, owner: string, repo: string, path: string, fileContent: string, message: string | null): Promise<boolean> {

        if (path.startsWith('/')) {
            path = path.slice(1);
        }

        const isFile = this.isPathFile(path);
        if (!isFile) {
            return null;
        }

        let folderPath = p.dirname(path);
        if (folderPath === '') {
            folderPath = '/';
        }
        const folderContent = await this.fetchFileContent(branch, owner, repo, folderPath);
        const foundFile: any = _.find(folderContent, (item: any) => {
            return item.type === 'file' &&
                (
                    item.path === path ||
                    `/${item.path}` === path
                );
        });

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
                    sha: foundFile?.sha
                },
            },
            CompatibilityCallToolResultSchema,
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

        // Use the real MCP schema with correct typing
        client.setNotificationHandler<typeof LoggingMessageNotificationSchema>(
        LoggingMessageNotificationSchema,
            (notification) => {
                const { level, logger, data } = notification.params;
                console.log(
                    `[${level}]${logger ? ` [${logger}]` : ""}`,
                    data
                );
            }
        );

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

    private isPathFile(path: string): boolean {
        // Remove trailing slashes
        const cleanPath = path.replace(/\/+$/, '');
        const ext = p.extname(cleanPath);
        return !!ext;
    }
}
