import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import Outline from "./tools/Outline.js";
import Gitea from "./tools/git/Gitea.js";
import { z } from "zod/v3";
import Github from "./tools/git/Github.js";
import { Content, ContentEncoding } from "./tools/Content.js";
import { loadWebComponentByMimeType } from "./common/Util.js";
import Git from "./tools/git/Git.js";
import GitFilesBrowser from "./tools/GitFilesBrowser.js";
import { executeJS } from "./tools/ExecuteJS.js";

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
}


function registerTools(server: McpServer) {
    // @ts-ignore
    // To void error TS2589: Type instantiation is excessively deep and possibly infinite.
    server.registerTool(
        "get_file_contents",
        {
            title: "Fetch File Content",
            description: "Fetches the content of a file from either Github or Gitea, given repository details and authentication token.",
            inputSchema: {
                url: z.string().describe("The base URL of the repository (Github or Gitea)."),
                token: z.string().describe("Authentication token for the repository."),
                branch: z.string().describe("The branch name to fetch the file from."),
                owner: z.string().describe("The owner of the repository."),
                repo: z.string().describe("The name of the repository."),
                path: z.string().describe("The path to the file within the repository.")
            }
        },
        async (body, extra) => {

            console.log('>>>> Received: ', body);

            const { url, token, branch, owner, repo, path } = body;
            await extra.sendNotification({
                method: "notifications/message",
                params: {
                    level: "info",
                    data: {
                        tool: "get_file_contents",
                        message: "Fetching file content..."
                    }
                }
            });

            let git: Git;

            if (url === Github.McpServerUrl) {
                git = new Github(url, token);
            } else {
                git = new Gitea(url, token);
            }

            try {
                const result = await git.fetchFileContent(branch, owner, repo, path);

                console.log('>>> result');
                console.log(result);

                if (!result) {
                    return {
                        isError: true,
                        content: [
                            {
                                type: "text",
                                text: "File not found or could not be fetched."
                            }
                        ],
                    };
                }

                if (Array.isArray(result)) {
                    // If result is an array, return a resource with a text/plain mimeType and JSON stringified array
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    mimeType: "text/plain",
                                    encoding: ContentEncoding.Utf8,
                                    blob: JSON.stringify(result),
                                })
                            }
                        ],
                    };
                } else {
                    const content: Content = result;
                    const dynamicComponent = loadWebComponentByMimeType(content.mimeType);

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    mimeType: content.mimeType,
                                    encoding: content.encoding,
                                    blob: content.data,
                                    dynamicComponent: dynamicComponent,
                                })
                            }
                        ],
                    };
                }
            } catch (exception: any) {
                console.error(exception);
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: exception.message
                        }
                    ],
                };
            }
        }
    );

    // @ts-ignore
    // To void error TS2589: Type instantiation is excessively deep and possibly infinite.
    server.registerTool(
        "save_file_contents",
        {
            title: "Update File Content",
            description: "Updates the content of a file in either Github or Gitea, given repository details and authentication token.",
            inputSchema: {
                url: z.string().describe("The base URL of the repository (Github or Gitea)."),
                token: z.string().describe("Authentication token for the repository."),
                branch: z.string().describe("The branch name to update the file in."),
                owner: z.string().describe("The owner of the repository."),
                repo: z.string().describe("The name of the repository."),
                path: z.string().describe("The path to the file within the repository."),
                content: z.any().describe("The content to be saved in the file. Can be a string or an object."),
            }
        },
        async ({ url, token, branch, owner, repo, path, content }, extra) => {
            await extra.sendNotification({
                method: "notifications/message",
                params: {
                    level: "info",
                    data: {
                        tool: "save_file_contents",
                        message: "Updating file content..."
                    }

                }
            });

            let git: Git;

            if (url === Github.McpServerUrl) {
                git = new Github(url, token);
            } else {
                git = new Gitea(url, token);
            }

            try {
                const isSuccessful = await git.saveFileContent(branch, owner, repo, path, cleanText(typeof content === 'string' ? content : JSON.stringify(content)), '');
                return {
                    isError: !isSuccessful,
                    content: [
                        {
                            type: "text",
                            text: !isSuccessful ? "Failed to update the file." : "File updated successfully!"
                        }
                    ],
                };
            } catch (exception) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: exception.message
                        }
                    ],
                };
            }
        }
    );

    // @ts-ignore
    // To void error TS2589: Type instantiation is excessively deep and possibly infinite.
    server.registerTool(
        "fetch_outline_text_file",
        {
            title: "Fetch Outline File Content",
            description: "Fetches the content of an outline file from a specified URL using an API key for authentication.",
            inputSchema: {
                baseUrl: z.string().describe("The base URL of the outline service."),
                apiKey: z.string().describe("API key for authentication with the outline service."),
                fileId: z.string().describe("The ID of the file to fetch content for."),
            }
        },
        async ({ fileId, baseUrl, apiKey }, extra) => {
            await extra.sendNotification({
                method: "notifications/message",
                params: {
                    level: "info",
                    data: {
                        tool: "fetch_outline_text_file",
                        message: "Fetching outline file content..."
                    }
                }
            });

            const outline = new Outline(baseUrl, apiKey);

            const content = await outline.fetch(fileId);

            const dynamicComponent = loadWebComponentByMimeType(content.mimeType);
            return {
                content: [
                    {
                        type: "resource",
                        resource: {
                            mimeType: content.mimeType,
                            encoding: content.encoding,
                            blob: content.data,
                            dynamicComponent: dynamicComponent,
                        }
                    }
                ],
            };
        }
    );

    // @ts-ignore
    // To void error TS2589: Type instantiation is excessively deep and possibly infinite.
    server.registerTool(
        "list_repository_files",
        {
            title: "List Repository Files",
            description: "Lists all files in a specified repository that match a given pattern. This tool works with both Github and Gitea repositories. To use it, provide the repository URL, authentication token, branch name, owner, repository name, and a pattern (such as a glob or file extension) to filter the files. The tool will return a list of file paths that match the pattern.",
            inputSchema: {
                url: z.string().describe("The base URL of the repository (Github or Gitea)."),
                token: z.string().describe("Authentication token for the repository."),
                branch: z.string().describe("The branch name to list files from."),
                owner: z.string().describe("The owner of the repository."),
                repo: z.string().describe("The name of the repository."),
                pattern: z.string().describe("A pattern to filter files (e.g., '*.js' for JavaScript files). This can be a glob pattern or a specific file extension.")
            }
        },
        async ({ url, token, branch, owner, repo, pattern }, extra) => {
            await extra.sendNotification({
                method: "notifications/message",
                params: {
                    level: "info",
                    data: {
                        tool: "list_repository_files",
                        message: "Listing repository files..."
                    }
                }
            });

            const gitFilesBrowser = new GitFilesBrowser(url, token, branch, owner, repo);
            const allFilePaths = await gitFilesBrowser.run(pattern);
            return {
                content: [
                    {
                        type: "resource",
                        resource: {
                            mimeType: 'text/plain',
                            encoding: ContentEncoding.Utf8,
                            blob: allFilePaths,
                        }
                    }
                ],
            };
        }
    );

    // @ts-ignore
    // To void error TS2589: Type instantiation is excessively deep and possibly infinite.
    server.registerTool(
        "execute_js",
        {
            title: "Execute JavaScript Code",
            description: "Executes a JavaScript code snippet with the provided input data. The code can access the input data through the variable `data`. The result will be returned as a text/plain resource.",
            inputSchema: {
                jsCode: z.string().describe("JavaScript code to execute. Use the variable `data` to access input."),
                input: z.any().describe("An input object that will be passed into the JavaScript code as `data`."),
            }
        },
        async ({ jsCode, input }, extra) => {
            await extra.sendNotification({
                method: "notifications/message",
                params: {
                    level: "info",
                    data: {
                        tool: "execute_js",
                        message: "Executing JavaScript code..."
                    }
                }
            });

            const result = executeJS(jsCode, input);
            return {
                content: [
                    {
                        type: "resource",
                        resource: {
                            mimeType: 'text/plain',
                            encoding: ContentEncoding.Utf8,
                            blob: result,
                        }
                    }
                ],
            };
        }
    );
}

function cleanText(text: string) {
    return text
        // Remove control characters (except \n \r \t)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

        // Remove invisible and no-break space characters
        .replace(/[\u00A0\u1680\u180E\u2000-\u200F\u202F\u205F\u2060\u3000\uFEFF]/g, '')

        // Remove zero-width characters: ZWSP, ZWNJ, ZWJ
        .replace(/[\u200B-\u200D]/g, '')

        // Remove emojis and extended pictographic symbols (requires Node 16+)
        .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')

        // Remove other invisible formatting Unicode characters
        .replace(/\p{Cf}/gu, '')  // Includes various invisible formatting characters

        // Remove private-use and unassigned Unicode characters
        .replace(/\p{Co}|\p{Cn}/gu, '')

        // Trim leading and trailing whitespace
        .trim();
}
