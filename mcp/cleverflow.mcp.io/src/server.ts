import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import Outline from "./tools/Outline.js";
import Gitea from "./tools/git/Gitea.js";
import z from "zod";
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

            let git: Git;

            if (url === Github.McpServerUrl) {
                git = new Github(url, token);
            } else {
                git = new Gitea(url, token);
            }

            try {
                const result = await git.fetchFileContent(branch, owner, repo, path);

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
                    // TODO
                    return {
                        content: [
                            {
                                type: "resource",
                                resource: result
                            }
                        ],
                    };
                } else {
                    const content: Content = result;
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
            } catch (exception: any) {
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

            let git: Git;

            if (url === Github.McpServerUrl) {
                git = new Github(url, token);
            } else {
                git = new Gitea(url, token);
            }

            try {
                const isSuccessful = await git.saveFileContent(branch, owner, repo, path, content, '');
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

    server.tool(
        "fetch_outline_text_file",
        "Fetches the content of a file from Outline using its file ID, given authentication.",
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

    server.tool(
        "list_repository_files",
        "Lists all files in a specified repository that match a given pattern. This tool works with both Github and Gitea repositories. To use it, provide the repository URL, authentication token, branch name, owner, repository name, and a pattern (such as a glob or file extension) to filter the files. The tool will return a list of file paths that match the pattern.",
        {
            url: z.string(),
            token: z.string(),
            branch: z.string(),
            owner: z.string(),
            repo: z.string(),
            pattern: z.string(),
        },
        async ({ url, token, branch, owner, repo, pattern }, extra) => {

            await extra.sendNotification({
                method: "notifications/message",
                params: {
                    level: "info",
                    message: "Listing repository files...",
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

    server.tool(
        "execute_js",
        "Executes a JavaScript snippet with a given input object in a secure sandbox using the V8 engine. The JavaScript code should return a value based on the input. This tool is useful for dynamic logic evaluation, templating, and configurable behavior. The input object is available as `data` inside the JavaScript code.",
        {
            jsCode: z.string().describe("JavaScript code to execute. Use the variable `data` to access input."),
            input: z.any().describe("An input object that will be passed into the JavaScript code as `data`."),
        },
        async ({ jsCode, input }, extra) => {
            await extra.sendNotification({
                method: "notifications/message",
                params: {
                    level: "info",
                    message: "Executing JavaScript code...",
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