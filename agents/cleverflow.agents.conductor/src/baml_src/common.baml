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
    field string
    isFieldArray bool
    isFieldRequired bool
    query string
    queryLanguage string
}

enum Encoding {
    Utf8
    Base64
    ByteArray
}

enum FieldType {
    String
    Number
    Boolean
    Array
    Object
}

class FieldEncoding {
    field string
    type FieldType
    encoding Encoding?
    itemType FieldType?
    itemEncoding Encoding?
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
        ---

        mcpTool:  
        {{ mcpTool }}

        userInputManually:  
        {{ userInputManually }}

        commonSettings:  
        {{ commonSettings }}

        **Important: Return only the final result as a single-line JSON string using `JSON.stringify`. Do not include any explanation, formatting, or Markdown code block. Just return the JSON string ready to be passed into `JSON.parse`.**
    "#
}

function DetectFieldEncodings(mcpTool: string) -> FieldEncoding[] {
    client Ollama_Code
    prompt #"
        Given the following MCP tool schema, extract the encoding information for all fields listed in inputSchema.required. For each required field, output a JSON object with:
            - field: the name of the required input field
            - type: its declared JSON Schema type
            - encoding: inferred encoding, such as "Utf8", "Base64", "ByteArray", etc. (optional, only for scalar fields)
            - itemType: if the field is an array, specify the item type
            - itemEncoding: if the field is an array, specify the encoding of each item
        Important:
            If type is "array", only use itemEncoding, not encoding.
            Only set encoding if the entire field value is encoded, not its parts.
        Use the "description" and "inputSchema" fields to help you infer the actual encoding the tool expects. Be careful: "type": "string" with "format": "binary" usually means the field expects base64-encoded binary. If the field is an array, consider how each item is encoded.
        Return the result as a JSON array of objects.

        MCP Tool:
        {{mcpTool}}

        ---
        {{ ctx.output_format }}
    "#
}

function MatchNodeOutputsToToolInputs(upstreamResult: string, mcpTool: string) -> OutputInputMatch[] {
    client Ollama_Tool
    prompt #"
        /no_think

        You are an expert in extracting matching values from JSON structures.

        You are given:

        - `upstreamResult`: the input JSON object for a MCP tool.
        - `mcpTool`: the full JSON Schema definition of the MCP tool, including its input schema.

        ### JSONata syntax examples:

        - Access a field: `object.property`
        - Extract list of values from array (returns array): `array[].property`  
        → e.g., `content[].resource.blob` returns all `blob` values from each `content` item
        - Extract single value: `a.b.c`
        - Access specific array element: `array[0].property`
        - Filter array (if needed): `array[field="value"].target`

        ### Rules:

        - The expression must always start from the root of `upstreamResult`.
        - Do not use optional chaining (`?`, `?.`, `[]?`) or JavaScript-like constructs.
        - Do not prefix expressions with variables like `$upstreamResult`.
        - The expression must clearly and precisely indicate the path to the correct data in `upstreamResult`, even if not fully valid JSONata.
        - Matching accuracy is top priority.
        - If `isFieldArray` is `true`, the `query` must return an array.
        - If `isFieldArray` is `false`, the `query` must return a single object or value.
        - Only include required fields in the output — i.e., fields listed in `mcpTool.inputSchema.required`.
        - Do not include any fields that are not in the required list.
        - All output objects must have `isFieldRequired: true`.

        ### Your task:

        For each input field listed in the `"required"` array of `mcpTool.inputSchema`, generate an object with the following structure:

        - `field`: the name of the required input field.
        - `isFieldArray`: `true` if the input field's type in the schema is `"array"` (i.e., `mcpTool.inputSchema.properties[field].type === "array"`), otherwise `false`.
        - `isFieldRequired`: always `true`, because you are only including fields listed in `mcpTool.inputSchema.required`. (If the field is not in the `required` array, it must not be included in the output at all.)
        - `query`: a best-effort JSONata-like expression that extracts the corresponding value from `upstreamResult`, respecting the rules above.
        - `queryLanguage`: always `"jsonata"`

        Inputs:

        - `upstreamResult`:  
        {{upstreamResult}}

        - `mcpTool`:  
        {{mcpTool}}

        ---
        {{ ctx.output_format }}
    "#
}

function WriteJSCode(taskDescription: string) -> string {
    client Ollama_Tool
    prompt #"
        /no_think

        You are an AI that writes JavaScript code to be embedded and executed in a Node.js VM environment.

        Given the following task description and input data, generate ONLY the **self-contained JavaScript function body** — that is, only the inner contents of a function, without the function declaration.

        ### Strict Rules:
        - Do NOT wrap the output in any function, IIFE, or code block.
        - Do NOT include the words: function, export, =>, or return inside a string.
        - Do NOT include any backticks, code fences (like ```javascript), markdown formatting, comments, or explanations.
        - The output must be a valid JavaScript function body.

        ### Execution Context:
        Your code will be inserted like this:
            const result = (function(data) {
                // [your generated code here.]
            })(data);
            return result;

        ### Requirements:
        {{taskDescription}}
        - Remember to return the final result: `return result;`

        Output only valid JavaScript code — nothing else.
    "#
}

function ExecuteDynamicTask(prompt: string, input: string) -> string {
    client Ollama_Code
    prompt #"
        /no_think

        {{prompt}}

        Input:
            {{input}}

        Return only the result. No explanation.
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

test Test_DetectFieldEncodings {
    functions [DetectFieldEncodings]
    args {
        mcpTool #"
            {
                "name": "convert_doc_files_into_text_chunks",
                "description": "Convert Document Files (PDF, Images, DOCX, PPTX, HTML) into Markdown Text + Contextual Text Chunks\n\nThis tool accepts binary file payloads (documents) and outputs structured data containing:\n- the full document converted to markdown, and\n- extracted, contextually enriched text chunks of uniform byte size.\n\nInput Parameters:\n-----------------\npayloads (list[bytes]):\n    A list of Base64-decoded binary files. Each item must be one of the following:\n        - PDF\n        - Image (e.g., PNG, JPG)\n        - DOCX (Microsoft Word)\n        - PPTX (PowerPoint)\n        - HTML\n\nchunk_size (int, optional):\n    Target size in **bytes** for each individual text chunk. Default is 512 bytes.\n    This is used to tune the granularity of chunked output.\n\nOutput Schema:\n--------------\nReturns a list of dictionaries. Each dictionary contains metadata and extracted results for one file.\n\nExample:\n```json\n[\n    {\n        \"file_size_bytes\": 24583,\n        \"header_hex\": \"255044462d312e34\",\n        \"text\": \" Title\\nThis is the full document content as markdown...\",\n        \"text_chunks\": [\n            \"This is chunk 1 content...\",\n            \"Chunk 2 with context...\",\n            ...\n        ],\n        \"duration\": 0.326  // Time taken for full processing in seconds\n    }\n]\n```\n\nNotes:\n------\n- The function internally determines document type using file headers and MIME heuristics.\n- Markdown conversion preserves structure (headings, lists, bold/italic, etc.).\n- Chunks are enriched via the `HybridChunker.contextualize()` function.\n- Suitable for NLP pipelines where long documents must be split before vectorization, search indexing, or LLM consumption.",
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
                        "payloads", "chunk_size"
                    ]
                },
                "outputSchema": {
                    "type": "object",
                    "properties": {
                        "result": {
                            "items": {
                                "additionalProperties": true,
                                "type": "object"
                            },
                            "title": "Result",
                            "type": "array"
                        }
                    },
                    "required": [
                        "result"
                    ],
                    "title": "_WrappedResult",
                    "x-fastmcp-wrap-result": true
                }
            }
        "#
            
    }
}

test Test_MatchNodeOutputsToToolInputs {
    functions [MatchNodeOutputsToToolInputs]
    args {
        upstreamResult #"
            {
                "content": [
                    {
                        "type": "dummy",
                        "resource": {
                            "mimeType": "dummy",
				            "encoding": "dummy",
                            "blob": "dummy",
                            "createdBy": "dummy",
                            "dynamicComponent": {
                                "tag": "dummy",
                                "scriptBase64": "dummy",
                                "propBindings": [
                                    {
                                        "componentProp": "dummy",
                                        "dataPath": "dummy"
                                    }
                                ]
                            }
                        }
                    }
                ],
                "source": "dummy"
            }
        "#
        mcpTool #"
            {
                "name": "convert_doc_files_into_text_chunks",
                "description": "Convert Document Files (PDF, Images, DOCX, PPTX, HTML) into Markdown Text + Contextual Text Chunks\n\nThis tool accepts Base64-encoded strings representing binary document files. It returns:\n  - the full document converted into Markdown, and\n  - a list of enriched text chunks split by byte size.\n\nParameters:\n-----------\npayloads (list[str]):\n    A list of Base64-encoded strings.\n    Each string must represent one of the following document types:\n      - PDF\n      - DOCX (Microsoft Word)\n      - PPTX (PowerPoint)\n      - HTML\n      - Image (e.g., PNG, JPEG)\n\nchunk_size (int, optional):\n    Desired chunk size in bytes. Controls how large each text segment will be.\n    Default is `512`.\n\nReturns:\n--------\nlist[dict[str, Any]]:\n    One entry per input document with the following structure:\n    ```json\n    {\n        \"file_size_bytes\": 24583,\n        \"header_hex\": \"255044462d312e34\",\n        \"text\": \"Document Title\\nFull document as markdown...\",\n        \"text_chunks\": [\n            \"This is chunk 1\",\n            \"This is chunk 2\",\n            ...\n        ],\n        \"duration\": 0.326\n    }\n    ```\n\nNotes:\n------\n- This tool is designed to support LLM pipelines, RAG, and semantic chunking workflows.\n- Markdown representation preserves structural formatting (e.g., bold, headers, links).\n- Uses `HybridChunker` for token-aware chunking and contextual enrichment.\n- If image content is passed, it must be a decodable format (JPG, PNG, etc.).",
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
                        "author": {
                            "title": "Author",
                            "type": "string"
                        },
                        "data_come_from": {
                            "title": "Data come from",
                            "type": "string"
                        },
                        "chunk_size": {
                            "default": 512,
                            "title": "Chunk Size",
                            "type": "integer"
                        }
                    },
                    "required": [
                        "payloads",
                        "author",
                        "data_come_from"
                    ]
                }
            }
        "#
    }
}

test Test_WriteJSCode {
    functions [WriteJSCode]
    args {
        taskDescription #"
            Write a JavaScript function that takes an array of file paths. Each path follows this pattern:

            orders/{orderNumber}/Documentation/{positionInOrder}/{language}/{productVariant}/{fileName}.pdf

            The function should:

            Use a regular expression with 5 capture groups to extract:

                orderNumber (string)

                positionInOrder (number)

                language (string)

                productVariant (string)

                fileName (string, without .pdf)

            Ignore paths that do not match the pattern.

            Return an array of extracted objects.
        "#
    }
}

test Test_ExecuteDynamicTask {
    functions [ExecuteDynamicTask]
    args {
        prompt #"
           Using the information provided in explanation, which describes the structure and meaning of each token in a product designation, extract all relevant product features from the following type key: productVariant.

            Return the result as a structured list showing:
            The name of each feature
            The corresponding value from productVariant
            A short interpretation based on explanation

            If any token is unclear or undefined in explanation, label it as "unspecified" and note that interpretation is not available. Ensure output is complete, concise, and aligns with the explanation logic.
        "#
        input #"
            Explanation: 
                |   Nummer | Bezeichnung               | Merkmale                                                                           |\\n|----------|---------------------------|------------------------------------------------------------------------------------|
            productVariant:
                {
                    "orderNumber": "40009326",
                    "positionInOrder": 1000,
                    "language": "DE",
                    "productVariant": "86351.400018_Fasspumpe EBP.30-DB-0200-P0165D-AW"
                }
        "#
    }
}