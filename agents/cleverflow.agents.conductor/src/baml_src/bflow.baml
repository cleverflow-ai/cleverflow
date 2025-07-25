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
  repeat bool
  prompt bool
  config string?
  state BFlowNodeState?
  stateMessage string?
  goto BFlowNode[]?
  tool BFlowNodeTool?
  toolInput string?
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
    prompt #"
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

        Parse optional tag attributes:

            repeat (default: false)

            prompt (default: false)
        
        If a node has children, assign them to its goto field.

        Nodes of type ACTION or CONDITION must be assigned a Tool from the provided list. 
        If prompt=true is set, then assign:
            "tool": { "name": "LLM" }
        If not sure, use a default tool.

        Analyze each node's text content to:

        Detect references to outputs from previous nodes, and include those node ids in the inputs array.

        For ACTION nodes, if the tool's inputSchema.required contains known keys (like url, apiKey, fileId, repo, etc.), extract values from the node text using natural language understanding and map them into a toolInput field as a JSON string, using the required keys of the tool as a guide.

        Example:
        If the node text is
        Fetching a gitea file from url https://example.com/api with key abc123
        and the tool requires baseUrl, apiKey, then

        "toolInput": "{ \"baseUrl\": \"https://example.com/api\", \"apiKey\": \"abc123\" }"
        
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
    prompt #"
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
            {% b-flow id="analyze-selling-products-flow" %}
                {% sequence %}     
                    
                    {% action id="action_1" %}
                        Extract all file paths matching the pattern:  
                        `orders/{orderNumber}/Documentation/{positionInOrder}/{language}/{productVariant}/*.pdf`
                    {% /action %}
                    
                    {% action id="action_2" %}
                        Analyze File Paths.

                        Write a JavaScript function that takes an array of file paths that come from the previous action node. Each path follows this pattern:
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
                    {% /action %}
                    
                    {% action id="action_3" %}
                        Fetch the content of an Excel file from Gitea located at `general/ENSOTypenschlÃ¼ssel.xlsx`.
                    {% /action %}
                    
                    {% action id="action_4" %}
                        Convert the Excel content from the action node with `id="action_3"` to plain text.
                    {% /action %}

                    {% action id="action_5"%}
                        Prepare product variant data. Take the `productVariants` array from the action node with `id="action_2"` and the explanation string from the action node with `id="action_4"`.
                        
                        Your task is to write a JavaScript code snippet that does only the following:

                            - `data[0]` is an array of product variants.
                            - `data[1]` is a string explanation.
                            - Create a new array named `mapped`, where each element is an object in the format `{ productVariant: <variant>, explanation: <explanation> }`.
                            - Return `mapped` at the end.

                        Output only the function body (no function declaration, IIFE, or `console.log`).
                    {% /action %}
                    
                    {% action id="action_6" repeat="true" prompt="true" %}
                        Analyze selling Products. Take the data list from the action node with `id="action_5"`.

                        Prompt:
                            Using the information provided in explanation, which describes the structure and meaning of each token in a 			product designation, extract all relevant product features from the following type key: productVariant.

                            Return the result as a structured list showing:
                            The name of each feature
                            The corresponding value from productVariant
                            A short interpretation based on explanation

                            If any token is unclear or undefined in explanation, label it as "unspecified" and note that interpretation is not available. Ensure output is complete, concise, and aligns with the explanation logic.		
                    {% /action %}

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