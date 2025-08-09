class BFlow {
  id string?
  name string?
  description string?
  root BFlowNode
}

enum BFlowNodeType {
    ENTRY
    FALLBACK
    SEQUENCE
    PARALLEL
    CONDITION
    ACTION
}

enum BFlowNodeState {
    RUNNING
    SUCCESS
    FAILURE
    WAITING_FOR_DATA
}

class BFlowNodeTool {
  name string
  description string
  inputSchema BFlowNodeToolInputSchema
}

class BFlowNodeToolInputSchema {
    required string[]
}

class BFlowNodeOutput {}

class BFlowNode {
  type BFlowNodeType
  id string?
  name string?
  description string?
  repeat bool?
  prompt bool?
  config string?
  state BFlowNodeState?
  stateMessage string?
  goto BFlowNode[]?
  tool BFlowNodeTool?
  toolInputJson string?
  inputs string[]?
  output BFlowNodeOutput?
}

class BFlowVizNode {
  type BFlowNodeType
  id string
  parentNodeId string?
  name string?
  description string?
  config string?
  tool BFlowNodeTool?
}

class BFlowVizEdge {
  id string
  source string
  target string
}

class BFlowViz {
  nodes BFlowVizNode[]
  edges BFlowVizEdge[]
}

function ParseMarkdocBFlowElementToBFlow(text: string, tools: BFlowNodeTool[]) -> BFlow {
    client Ollama_Code
    prompt #"/no_think

        You are an expert in Markdoc and Behavior Trees.

        ## Task: Convert Markdoc to JSON Tree
        Convert the given Markdoc element (representing a Behavior Tree) into a structured JSON format. Follow these rules:

        - The following are **non-ACTION nodes**: <% entry %>, <% fallback %>, <% sequence %>, <% parallel %>, <% condition %>. All other tags are treated as **ACTION** nodes.
        - For ACTION nodes, set:
        ```json
        { "type": "ACTION" }
        ```
        Instead of using the raw tag name for name, generate a natural, human-readable name for the node based on its content (text inside the element). Use verbs and objects in the text to summarize the action meaningfully.
        Example:
            For a node like <% outline-file-fetching %> Fetching an outline file <% /outline-file-fetching %>
            → "name": "Fetch Outline File"
            For a node describing Convert a steps file to glb
            → "name": "Convert Steps to GLB"
        
        Use the node's text content as the "description" field exactly as it appears — without rewriting, summarizing, reformatting, fixing grammar, or modifying it in any way. The content must be copied verbatim.

        Each node must have a unique id. If missing, generate one using the element name and its order of appearance.

        For each node, parse the optional attributes repeat and prompt from the tag. If either attribute is not specified, default to:
            repeat: false,
            prompt: false
        
        If a node has children, assign them to its goto field.

        For nodes of type ACTION or CONDITION:
            Assign the most appropriate tool to the node by comparing the node's description text with the name and description fields of each tool in the provided list of MCP tools.
            Matching must be based on clear, explicit evidence in the node's description (e.g., keywords, function purpose, context) that corresponds to the tool's name or description.
            If the node's prompt property is true OR no matching tool can be confidently determined, then assign exactly:
                {
                    "name": "execute_prompt",
                    "description": "Executes a natural language prompt using a Large Language Model (LLM)",
                    "inputSchema": {}
                }
            Do not guess, infer, or fabricate matches.
            Do not create or modify tool definitions — only select from the provided tool list or use execute_prompt as specified.
            Always output the assigned tool object exactly as defined, with correct field names and values.

        Analyze each node's text content to:
            Detect references to outputs from previous nodes, and include those node ids in the inputs array.
            For creating the toolInputJson property of an ACTION node:
                The tool's inputSchema.required defines the list of required keys (e.g., url, apiKey, fileId, repo, path, etc.).
                Extract only the values for these keys from the node's description using natural language understanding.
                Do not infer, assume, guess, or fabricate any value. If a required key is not explicitly stated in the description, omit that key from the output.
                If no required keys have matching values in the description, output {}.
                The toolInputJson must be a single-line JSON string, properly escaped if needed.
                Only include keys present in inputSchema.required and found in the description.
                Examples:
                    Description: "Fetching a gitea file from url https://example.com/api with key abc123"
                    Required keys: baseUrl, apiKey
                    Output: "toolInputJson": "{ \"baseUrl\": \"https://example.com/api\", \"apiKey\": \"abc123\" }"

                    Description: "Save the result from the previous task into the Gitea repository at given path \general/terminology.json`" Required keys:path Output:"toolInputJson": "{ "path": "general/terminology.json" }"`

                    Description: "Download the file"
                    Required keys: url, fileId
                    Output: "toolInputJson": "{}"
        
        Return only the final JSON result — no extra explanations.

        Markdoc:
        {{ text }}

        Tools:
        {{ tools }}

        {{ ctx.output_format }}
    "#
}

function ParseBFlowToBFlowViz(bflow: string) -> BFlowViz {
    client Ollama_Code
    prompt #"/no_think

        You are an expert in Markdoc, Behavior Tree, and JSON processing.

        ## Task 1: Flatten JSON Tree into Node Array
        - Traverse the input JSON tree from root, and flatten it into an array of node objects.
        - Each node must have:
            - Ensure each node has a unique id.
            - Use the existing id if present; otherwise, generate a unique 10-character string.
            - a `parentNodeId` (null for root).
        - Preserve all existing fields in each node.
        - If the node has type `ACTION`, ensure the following:
            - Keep its `name` as-is.
            - Keep its `tool` field **as an object**, exactly as defined in the original node (do not convert or remove it).
        
        ## Task 2: Generate Edges
        - Create an array of edge objects representing parent-child relationships.
        - Each edge must include:
            - `id`: a unique 10-character random string.
            - `source`: the parent node's `id`.
            - `target`: the child's `id`.

        Return only the final results in JSON. Do not explain anything.
        ---
        {{ bflow }}
        ---
        {{ ctx.output_format }}

    "#
}

test Test_ParseMarkdocBFlowElementToBFlow {
    functions [ParseMarkdocBFlowElementToBFlow]
    args {
        text #"
            {% b-flow id="bflow-crawl-terminology" %}
                {% sequence %}     
                    {% task id="action_1" %}
                        Crawl terminology data from MemoQWeb
                    {% /task %}
                    
                    {% task id="action_2" %}
                        Save the result from the previous task into the Gitea repository at given path `general/terminology.json`
                    {% /task %}		
                {% /sequence %}
            {% /b-flow %}
        "#,
        
        tools [
            {
                name "convert_doc_files_into_text_chunks",
                description "Tool convert_doc_files_into_text_chunks from MCP client",
                inputSchema {
                    required [
                        "payloads"
                    ]
                }
            },
            {
                name "convert_step_to_glb",
                description "Tool convert_step_to_glb from MCP client",
                inputSchema {
                    required [
                        "rpUsername",
                        "rpPassword",
                        "rpModelName"
                    ]
                }
            }, 
            {
                name "fetch_outline_text_file",
                description "Tool fetch_outline_text_file from MCP client",
                inputSchema {
                    required [
                        "baseUrl",
                        "apiKey",
                        "fileId"
                    ]
                }
            }, 
            {
                name "get_file_contents",
                description "Tool get_file_contents from MCP client",
                inputSchema {
                    required [
                        "url",
                        "token",
                        "branch",
                        "owner",
                        "repo",
                        "path"
                    ]
                }
            }, 
            {
                name "save_file_contents",
                description "Tool save_file_contents from MCP client",
                inputSchema {
                    required [
                        "url",
                        "token",
                        "branch",
                        "owner",
                        "repo",
                        "path",
                        "content"
                    ]
                }
            }            
        ]
    }
}

test Test_ParseBFlowToBFlowViz {
    functions [ParseBFlowToBFlowViz]
    args {
        bflow #"
            {
                "id": null,
                "name": null,
                "description": null,
                "root": {
                    "type": "ENTRY",
                    "id": "entry_1",
                    "name": null,
                    "description": null,
                    "config": null,
                    "state": null,
                    "goto": [
                        {
                            "type": "SEQUENCE",
                            "id": "sequence_1",
                            "name": null,
                            "description": null,
                            "config": null,
                            "state": null,
                            "goto": [
                                {
                                    "type": "ACTION",
                                    "id": "action_1",
                                    "name": "gitea-file-fetching",
                                    "description": "Fetching a gitea file",
                                    "config": null,
                                    "state": null,
                                    "goto": null,
                                    "tool": {
                                        "name": "get_file_contents",
                                        "description": ""
                                    },
                                    "inputs": [],
                                    "output": {}
                                },
                                {
                                    "type": "ACTION",
                                    "id": "action_2",
                                    "name": "outline-file-fetching",
                                    "description": "Fetching a outline file",
                                    "config": null,
                                    "state": null,
                                    "goto": null,
                                    "tool": {
                                        "name": "fetch-outline-text-file",
                                        "description": ""
                                    },
                                    "inputs": [],
                                    "output": {}
                                },
                                {
                                    "type": "ACTION",
                                    "id": "action_3",
                                    "name": "convert-steps-to-glb",
                                    "description": "Convert a steps file to glb",
                                    "config": null,
                                    "state": null,
                                    "goto": null,
                                    "tool": {
                                        "name": "convert-step-to-glb",
                                        "description": ""
                                    },
                                    "inputs": [],
                                    "output": {}
                                }
                            ],
                            "tool": null,
                            "inputs": null,
                            "output": null
                        }
                    ],
                    "tool": null,
                    "inputs": null,
                    "output": null
                }
            }
        "#
    }
}