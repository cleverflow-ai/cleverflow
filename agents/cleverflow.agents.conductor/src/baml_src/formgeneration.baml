class JsonFormProperty {
    title string
    type string
    format string?
}

class JsonForm {
  type string
  title string
  properties map<string, JsonFormProperty>
  required string[]
}

// TODO: add node description
// change function name to GenerateJsonForm
// generate only required fields
function ConvertToJsonForm(input: string) -> JsonForm {
    client Ollama_Tool
    prompt #"
       Convert the following JSON Schema into a JSON Form Schema compatible with @sjsf/form.

        Requirements:
        - Add a "title" field to the root, generate a friendly name.
        - For each property, add a "title" that is human-readable. For example: "fileId" → "File ID".
        - Preserve "type", "properties", and "required".
        - Remove "$schema" and "additionalProperties" fields if they exist.
        - If a property name or description contains keywords like "token", "apiKey", "secret", or "password", set its format to "password" so the field will render as a password input.

        Note: Do not change "type" to "password" — keep it as "string" and use `"format": "password"` for compatibility.

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