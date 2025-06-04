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
        { "type": "ACTION", "name": "<tag-name-without-<%%>>" }
        ```
        For example: <% outline-file-fetching %> becomes "name": "outline-file-fetching".

        If there is text before a Markdoc element, use it as that node’s description. Otherwise, auto-generate the description from inside the element.

        Each node must have a unique id. If missing, generate one using the element name and its order of appearance.

        If a node has children, assign them to its goto field.

        Nodes of type ACTION or CONDITION must be assigned a Tool from the provided list. If not sure, use a default tool.

        Analyze each description to detect references to outputs from previous nodes. Add those node ids to the inputs array. If none, leave inputs empty.

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
                    {% gitea-file-fetching id="action_1" %}
                        Fetching a gitea file
                    {% /gitea-file-fetching %}

                    {% outline-file-fetching id="action_2" %}
                        Fetching a outline file
                    {% /outline-file-fetching %}

                    {% convert-steps-to-glb id="action_3" %}
                        Convert a steps file to glb
                    {% /convert-steps-to-glb %}
                {% /sequence %}
            {% /b-flow %}
        "#,
        
        tools [
            {
                name "fetch-outline-text-file",
                description ""
            },
            {
                name "fetch-gitea-text-file",
                description ""
            },
            {
                name "convert-step-to-glb",
                description ""
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