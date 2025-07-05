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