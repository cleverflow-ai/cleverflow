import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import Outline from "./tools/Outline.js";
import Gitea from "./tools/Gitea.js";
import z from "zod";
import Github from "./tools/Github.js";
import { Base64Content } from "./tools/Base64Content.js";
import { loadWebComponentByMime } from "./common/Util.js";

export function createServer() {
    const server = new McpServer({
        name: "@cleverflow-ai/cleverflow.mcp.io",
        version: "1.0.0"
    }, {
        capabilities: {
            logging: {

            }
        }
    });
    console.log("MCP Server created");

    registerResources(server);
    registerTools(server);

    return server;
}

function registerResources(server: McpServer) {

    // server.resource(
    //     "web-components",
    //     new ResourceTemplate("web-components://{name}", {
    //         list: async () => ({
    //             resources: [
    //                 {
    //                     name: "glb-viewer",
    //                     uri: "web-components://glb-viewer",
    //                     description: "Web component that renders GLB 3D models from a URL or base64 data.",
    //                 },
    //                 {
    //                     name: "pdf-viewer",
    //                     uri: "web-components://pdf-viewer",
    //                     description: "Web component for viewing PDF file contents.",
    //                 }
    //             ]
    //         })
    //     }),
    //     async (uri, { name }) => {
    //         const filePath = path.join("web-components", name as string);
    //         const buffer = fs.readFileSync(filePath);
    //         const base64Data = buffer.toString('base64');
    //         return {
    //             content: [{
    //                 uri: uri.href,
    //                 data: base64Data,
    //             }]
    //         };
    //     }
    // );
}

function registerTools(server: McpServer) {

    server.tool(
        "fetch-outline-text-file",
        "Fetches the content of a file from Outline using its file ID.",
        {
            baseUrl: z.string(),
            apiKey: z.string(),
            fileId: z.string(),
        },
        async ({ fileId, baseUrl, apiKey }, extra) => {
            await extra.sendNotification({
                method: "notifications/message",
                params: {
                    level: "info",
                    message: "Fetching outline file content...",
                }
            });

            const outline = new Outline(baseUrl, apiKey);
            const text = await outline.fetch(fileId);

            return {
                content: [
                    {
                        type: "text",
                        text: text
                    }
                ],
            };
        }
    );

    server.tool(
        "get_file_contents",
        "Fetches the content of a file from either Github or Gitea, given repository details and authentication.",
        {
            url: z.string(),
            token: z.string(),
            branch: z.string(),
            owner: z.string(),
            repo: z.string(),
            path: z.string(),
        },
        async ({ url, token, branch, owner, repo, path, }, extra) => {

            await extra.sendNotification({
                method: "notifications/message",
                params: {
                    level: "info",
                    message: "Fetching file content...",
                }
            });

            let result: any = null;

            if (url === Github.McpServerUrl) {
                try {
                    const github = new Github(token);
                    result = await github.fetch(branch, owner, repo, path);
                } catch (exception: any) {
                    console.log(exception);
                    return {
                        error: {
                            message: exception.message,
                        },
                    };
                }
            } else {
                try {
                    const gitea = new Gitea(url, token);
                    result = await gitea.fetchFileContent(branch, owner, repo, path);
                } catch (exception) {
                    return {
                        error: {
                            message: exception.message,
                        },
                    };
                }
            }

            if (!result) {
                return {
                    content: [
                        {
                            type: "data",
                            data: result
                        }
                    ],
                };
            }

            if (Array.isArray(result)) {
                return {
                    content: [
                        {
                            type: "data",
                            data: result
                        }
                    ],
                };
            } else {
                const base64File: Base64Content = result;
                const dynamicComponent = loadWebComponentByMime(base64File.mime);
                return {
                    content: [
                        {
                            type: "data",
                            data: {
                                base64FileContent: base64File.base64Content,
                                dynamicComponent: dynamicComponent,
                            }
                        }
                    ],
                };
            }
        }
    );

    server.tool(
        "save_file_contents",
        "Saves or updates the content of a file in either Github or Gitea, given repository details and authentication.",
        {
            url: z.string(),
            token: z.string(),
            branch: z.string(),
            owner: z.string(),
            repo: z.string(),
            path: z.string(),
            content: z.string(),
        },
        async ({ url, token, branch, owner, repo, path, content }, extra) => {

            await extra.sendNotification({
                method: "notifications/message",
                params: {
                    level: "info",
                    message: "Updating file content...",
                }
            });

            let isSuccessful: any;

            if (url === Github.McpServerUrl) {
                try {
                    const github = new Github(token);
                    await github.createOrUpdateFile(branch, owner, repo, path, content, null);
                } catch (exception: any) {
                    return {
                        error: {
                            message: exception.message,
                        },
                    };
                }
            } else {
                try {
                    const gitea = new Gitea(url, token);
                    isSuccessful = await gitea.saveFileContent(branch, owner, repo, path, content);
                } catch (exception) {
                    return {
                        error: {
                            message: exception.message,
                        },
                    };
                }
            }

            return {
                isError: !isSuccessful,
                content: [
                    {
                        type: "text",
                        text: !isSuccessful ? "Failed to update the file." : "File updated successfully!"
                    }
                ],
            };
        }
    );
}