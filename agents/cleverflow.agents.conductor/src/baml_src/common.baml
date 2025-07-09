class RepoIntegrationSettings {
  name string?
  description string?
  url string
  token string
  branch string
  owner string
  repo string
}

class OutputInputMatch {
    matchedInputField string?
    descriptionIndex int
}

function GetRepoIntegrationSettings(input: string) -> RepoIntegrationSettings {
    client Ollama_Code
    prompt #"
        I have a list of configuration JSON objects, each with fields like name, description, url, token, and other relevant keys.
        Please return the first JSON object from the list that is for Gitea or GitHub integration settings.
        Return the result as a valid JSON object only, with the same structure as in the list.
        Do not include any explanations or extra text.
        Input:
        {{ input }}
        ---
        {{ ctx.output_format }}
    "#
}

function GenerateMcpToolPayload(mcpTool: string, userInputManually: string, commonSettings: string) -> string {
    client Ollama_Code
    prompt #"
       You are given:
        - `mcpTool`: a tool definition containing an input schema (defined using JSON Schema).
        - `userInputManually`: an optional string that may contain a JSON object as input.
        - `commonSettings`: a stringified JSON array of reusable configuration objects (e.g., for GitHub, Outline, etc.).

        Your task is to return a valid JSON object that satisfies the input schema of `mcpTool`.

        Follow these steps:

        1. If `userInputManually` is provided and is a valid JSON string:
        - Parse it and use its fields as the base input **only if it matches the input schema**.

        2. If `userInputManually` is not provided or incomplete:
        - Parse `commonSettings` as a JSON array.
        - Look for a setting object whose `name` or `description` appears to match the purpose of the `mcpTool`.
        - Use relevant fields from that matched object to populate the required properties of the input schema.
            - For example:
            - If the schema requires `baseUrl` and the setting has `url`, use it.
            - If the schema requires `apiKey` and the setting has `token`, `apiKey`, or `key`, use it.

        3. When merging values:
        - Fields from `userInputManually` should take precedence over those from `commonSettings`.

        4. If a required field in the input schema is not available from either source, leave it blank (e.g., an empty string `""`).

        **Important: Return only the final result as a single-line JSON string using `JSON.stringify`. Do not include any explanation, formatting, or Markdown code block. Just return the JSON string ready to be passed into `JSON.parse`.**
        ---

        mcpTool:  
        {{ mcpTool }}

        userInputManually:  
        {{ userInputManually }}

        commonSettings:  
        {{ commonSettings }}

    "#
}

function GetToolOutputDescription(nodeDescription: string, mcpTool: string, userInput: string) -> string {
    client Ollama_Code
    prompt #"
        You are an AI assistant.

        Below is a node from a flow-based system that uses a specific tool to process user input. The goal is to describe what this node produces, based on the tool's purpose and the given user input.

        Your task:
        Generate a **short, clear, and informative description** of the expected output that this node would produce. Base your answer on the node context, the tool's description, and the user input.

        Make sure to **omit or redact any sensitive information**, such as usernames, passwords, API keys, tokens, or any credentials that may appear in the input.

        Node Description:
        {{nodeDescription}}

        Tool Information (as JSON):
        {{mcpTool}}

        User Input (as JSON):
        {{userInput}}

        Now write a concise description of what the output of this node would be.

        ---
        {{ ctx.output_format }}

    "#
}

function MatchNodeOutputsToToolInputs(descriptions: string[], mcpTool: string) -> OutputInputMatch[] {
    client Ollama_Code
    prompt #"
        You are an AI assistant working in a flow-based automation system.

        You are given:
        1. A list of descriptions representing outputs from previous nodes in the flow.
        2. A tool (MCP Tool) that defines a JSON input schema with required and optional fields.

        Your task:
        For each description in the list, determine which input field in the tool's schema it best matches — if any. Match is based on the type, purpose, and format described.

        Return a JSON array of objects in the following format:
        - descriptionIndex: index of the description (starting from 0)
        - matchedInputField: the name of the matched input field, or null if no suitable match

        Do not include explanations or reasoning. Only return the JSON array.

        ---

        Mcp Tool: 
        {{mcpTool}}

        Descriptions:
        {{descriptions}}

        → Now return the matching result as a JSON array (no explanation).

        ---
        {{ ctx.output_format }}
    "#
}

test Test_GetRepoIntegrationSettings {
    functions [GetRepoIntegrationSettings]
    args {
        input #"
            [
                {
                    "name": "Gitea Integration Settings",
                    "description": "Configuration settings for integrating with the Gitea API used in the Atlas Copco project repository.",
                    "url": "https://gitea-atlascopco-integration.clevernow.com/api/v1",
                    "token": "abc",
                    "branch": "main",
                    "owner": "clevernow",
                    "repo": "atlascopco-dasm"
                },
                {
                    "name": "Outline Integration Settings",
                    "description": "Configuration settings for integrating with the Outline knowledge base API.",
                    "url": "https://docs-atlascopco.clevernow.com/api",
                    "token": "abc"
                },
                {
                    "name": "MCP 3D Settings",
                    "description": "Configuration settings for downloading GLB files from the MCP 3D using basic authentication.",
                    "username": "abc",
                    "password": "abc"
                },
                {
                    "name": "GitHub Integration Settings",
                    "description": "Configuration settings for integrating with the GitHub MCP for the Examples project repository.",
                    "url": "https://api.githubcopilot.com/mcp/",
                    "token": "abc",
                    "branch": "main",
                    "owner": "clevernow",
                    "repo": "examples"
                }
            ]
        "#
    }
}

test Test_GenerateMcpToolPayload {
    functions [GenerateMcpToolPayload]
    args {
        mcpTool #"
            {
                "name": "get_file_contents",
                "description": "This tool is for fetching file content that come from Github or Gitea",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "url": {
                            "type": "string"
                        },
                        "token": {
                            "type": "string"
                        },
                        "branch": {
                            "type": "string"
                        },
                        "owner": {
                            "type": "string"
                        },
                        "repo": {
                            "type": "string"
                        },
                        "path": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "url",
                        "token",
                        "branch",
                        "owner",
                        "repo",
                        "path"
                    ],
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        "#
        userInputManually #"
            {
                "path": "simple.mdoc"
            }
        "#
        commonSettings #"
            [
                {
                    "name": "Gitea Integration Settings",
                    "description": "Configuration settings for integrating with the Gitea API used in the Atlas Copco project repository.",
                    "url": "https://gitea-atlascopco-integration.clevernow.com/api/v1",
                    "token": "abc",
                    "branch": "main",
                    "owner": "clevernow",
                    "repo": "atlascopco-dasm"
                },
                {
                    "name": "Outline Integration Settings",
                    "description": "Configuration settings for integrating with the Outline knowledge base API.",
                    "url": "https://docs-atlascopco.clevernow.com/api",
                    "token": "abc"
                },
                {
                    "name": "MCP 3D Settings",
                    "description": "Configuration settings for downloading GLB files from the MCP 3D using basic authentication.",
                    "username": "abc",
                    "password": "abc"
                },
                {
                    "name": "GitHub Integration Settings",
                    "description": "Configuration settings for integrating with the GitHub MCP for the Examples project repository.",
                    "url": "https://api.githubcopilot.com/mcp/",
                    "token": "abc",
                    "branch": "main",
                    "owner": "clevernow",
                    "repo": "examples"
                }
            ]
        "#
    }
}

test Test_GetToolOutputDescription {
    functions [GetToolOutputDescription]
    args {
        nodeDescription "Fetch PDF File from: https://gitea-atlascopco-integration.clevernow.com/clevernow/atlascopco-dasm/src/branch/main/orders/40009326/Documentation/4000/EN/89971.000001_Meter/89971.000001_EDM.pdf"
        mcpTool #"
            {
                "name": "get_file_contents",
                "description": "This tool is for fetching file content that come from Github or Gitea",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "url": {
                            "type": "string"
                        },
                        "token": {
                            "type": "string"
                        },
                        "branch": {
                            "type": "string"
                        },
                        "owner": {
                            "type": "string"
                        },
                        "repo": {
                            "type": "string"
                        },
                        "path": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "url",
                        "token",
                        "branch",
                        "owner",
                        "repo",
                        "path"
                    ],
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        "#
        userInput #"
            {
                "url": "https://gitea-atlascopco-integration.clevernow.com/api/v1",
                "token": "04f4b0dada8fa8632dc7541f2f2131c703693e7e",
                "owner": "clevernow",
                "branch": "main",
                "repo": "atlascopco-dasm",
                "path": "orders/40009326/Documentation/4000/EN/89971.000001_Meter/89971.000001_EDM.pdf"
            }
        "#
    }
}

test Test_MatchNodeOutputsToToolInputs {
    functions [MatchNodeOutputsToToolInputs]
    args {
        descriptions [
            "Hello world"
            "The node is configured to fetch and return the content of a specific PDF file hosted on Gitea, utilizing the provided URL endpoint, authentication token, repository details, branch name, and exact path. The expected output from this operation will be the binary data of the document located at https://gitea-atlascopco-integration.clevernow.com/clevernow/atlascopco-dasm/src/branch/main/orders/40009326/Documentation/4000/EN/89971.000001_Meter/89971.000001_EDM.pdf as a downloadable file. The operation's success ensures that the content can be accessed directly and used or further processed as needed.",
            "TODO example 1"
        ]
        mcpTool #"
            {
                "name": "convert_doc_files_into_text_chunks",
                "description": "Convert Documentation Files (PDF, Images, DOCX, PPTX, and HTML) into Text Chunks.\n\nArgs:\n    payloads: Documentation Files (PDF, Images, DOCX, PPTX, and HTML) as binary data.\n    chunk_size: Desired size of output text chunks in bytes. By default, it is set to 512 bytes.\n\nReturns:\n    A dictionary with processed results.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "payloads": {
                            "items": {
                                "format": "binary",
                                "type": "string"
                            },
                            "title": "Payloads",
                            "type": "array"
                        },
                        "chunk_size": {
                            "default": 512,
                            "title": "Chunk Size",
                            "type": "integer"
                        }
                    },
                    "required": [
                        "payloads"
                    ]
                }
            }
        "#
    }
}