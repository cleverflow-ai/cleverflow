class RepoIntegrationSettings {
  name string?
  description string?
  url string
  token string
  branch string
  owner string
  repo string
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
                "url": "test",
                "token": "test",
                "branch": "test",
                "owner": "test",
                "repo": "test"
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