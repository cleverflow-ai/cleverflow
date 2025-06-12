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
    WAITING_FOR_CLIENT
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
  config string?
  state BFlowNodeState?
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

        Each node must have a unique id. If missing, generate one using the element name and its order of appearance.

        If a node has children, assign them to its goto field.

        Nodes of type ACTION or CONDITION must be assigned a Tool from the provided list. If not sure, use a default tool.

        Analyze each node's text content to:

        Generate a description if not explicitly given.

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
            - a unique 10-character random string as `id`.
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
            {% b-flow id="cleverflow-mcp-a2a" %}
                {% sequence %}                    
                    {% task-1 id="action_1" %}
                        Fetching README.md file in repo atlascopco-dasm which onwed by clevernow from url https://gitea-atlascopco-integration.clevernow.com/api/v1 with key 04f4b0dada8fa8632dc7541f2f2131c703693e7e
                    {% /task-1 %}

                    {% task-2 id="action_2" %}
                        Fetching a outline file by id sealing-technologies-rrOT5m2iSz from https://docs-atlascopco.clevernow.com/api with key ol_api_qHHZcDQ8EKJfx9tKwbi7E2zeT30Rnx5bq1uMfO
                    {% /task-2 %}

                    {% convert-steps-to-glb id="action_3" %}
                        Convert a steps file to glb, some information may be required
                        - username: info@clevernow.com
                        - password: CleverNow88
                        - model name: 89971.000001
                    {% /convert-steps-to-glb %}
                {% /sequence %}
            {% /b-flow %}
        "#,
        
        tools [
            {
                name "fetch-outline-text-file",
                description "",
                inputSchema {
                    required [
                        "fileId",
                        "baseUrl",
                        "apiKey"
                    ]
                }
            },
            {
                name "fetch-gitea-text-file",
                description "",
                inputSchema {
                    required [
                        "baseUrl",
                        "apiKey",
                        "repoOwner",
                        "repo",
                        "filePath"
                    ]
                }
            },
            {
                name "convert-step-to-glb",
                description "",
                inputSchema {
                    required [
                        "username",
                        "password",
                        "modelName"
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
                                        "name": "fetch-gitea-text-file",
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