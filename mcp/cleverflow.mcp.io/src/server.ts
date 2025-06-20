import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import Outline from "./resources/Outline.js";
import Gitea from "./resources/Gitea.js";
import z from "zod";
import Github from "./resources/Github.js";

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
    server.resource(
        "echo",
        "echo://helloWorld",
        async (uri, { }) => (
            {
                contents: [
                    {
                        uri: uri.href,
                        text: 'Hello world!'
                    }
                ],
            }
        )
    );
    console.log("Echo resource registered");

    // server.resource(
    //     "outline",
    //     new ResourceTemplate("outline://{fileId}", { list: undefined }),
    //     async (uri, { fileId }, extra) => {
    //         // const outline = new Outline(baseUrl as string, apiKey as string);
    //         // const text = await outline.fetch(fileId as string);
    //         console.log(uri);

    //         return {
    //             contents: [
    //                 {
    //                     uri: uri.href,
    //                     text: "Test"
    //                 }
    //             ],
    //         };
    //     }
    // );
    // console.log("Outline resource registered");
}

function registerTools(server: McpServer) {

    server.tool(
        "fetch-outline-text-file",
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

            let result: any;

            if (url === Github.McpServerUrl) {
                try {
                    const github = new Github(token);
                    result = await github.fetch(branch, owner, repo, path);
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
                    result = await gitea.fetchFileContent(branch, owner, repo, path);
                } catch (exception) {
                    return {
                        error: {
                            message: exception.message,
                        },
                    };
                }
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
                return {
                    content: [
                        {
                            type: "text",
                            text: result
                        }
                    ],
                };
            }


        }
    );

    server.tool(
        "update_file_contents",
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
                // TODO:
                // try {
                //     const github = new Github(token);
                //     result = await github.fetch(branch, owner, repo, path);
                // } catch (exception: any) {
                //     return {
                //         error: {
                //             message: exception.message,
                //         },
                //     };
                // }
            } else {
                try {
                    const gitea = new Gitea(url, token);
                    isSuccessful = await gitea.updateFileContent(branch, owner, repo, path, content);
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