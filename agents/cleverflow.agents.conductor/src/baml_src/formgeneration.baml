class JsonFormProperty {
    title string
    type string
}

class JsonForm {
  type string
  title string
  properties map<string, JsonFormProperty>
  required string[]
}

function ConvertToJsonForm(input: string) -> JsonForm {
    client Ollama_Tool
    prompt #"
        Convert the following JSON Schema into a JSON Form Schema compatible with @sjsf/form@2.0.0-next.15.

        Requirements:
        - Add a "title" field to the root, generate a friendly name.
        - For each property, add a "title" that is human-readable. For example: "fileId" → "File ID".
        - Preserve "type", "properties", "required".
        - Remove "$schema" and "additionalProperties" fields if they exist.
        Input:
        {{ input }}
        ---
        {{ ctx.output_format }}
    "#
}

test Test_ConvertToJsonForm {
    functions [ConvertToJsonForm]
    args {
        input #"
            {
                "name": "fetch-outline-text-file",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "fileId": {
                            "type": "string"
                        },
                        "baseUrl": {
                            "type": "string"
                        },
                        "apiKey": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "fileId",
                        "baseUrl",
                        "apiKey"
                    ],
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        "#
    }
}