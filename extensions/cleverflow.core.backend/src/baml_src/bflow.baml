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

class BFlowNodeAgent {
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
  agent BFlowNodeAgent?
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
  agent BFlowNodeAgent?
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

function ParseMarkdocBFlowElementToBFlow(text: string, agents: BFlowNodeAgent[]) -> BFlow {
    client Ollama_Tool
    prompt #"
        As an expert in Markdoc and Behavior Tree:
        You consider my given Mardoc custom element which represents a Behavior Tree with different node types such as "sequence", "action", etc. 
        You also consider my given list of Agents.
        Please convert the given element with its children to a JSON format.
        Just result and no verbose please!
        
        It is noted that:
        - If Markdoc entry name is not <% entry %>, <% fallback %>, <% sequence %>, <% parallel %>, or <% condition %>, then it is an ACTION node.
        - If there is any text locating before the Markdoc node-element, than extract it as the description of the corresponding node. Otherwise, auto generates the description based on the text inside the Markdoc element.
        - The Tree / each Node needs a Unique Id. If there is no Id given in the Markdoc element, assign it with a unique Id which can be constructed with its name and its appearing sequennce.
        - If it is about ACTION node, the name of the node corresponds to the name of the Markdoc element.
           - For example: '<% get-text %>' must be converted to { type: "ACTION", name: "get-text" }
        - If markdoc element contains children, then they should be added to the 'goto' field of the nearest father node.
        - Each Node with type 'ACTION' or 'CONDITION' needs a corresponding Agent given in the Agents list. If you cannot decide which Agent to assign, just assign the default one.
        - Analyze on the description, identity the names of other previous Nodes whose outputs are required for it. Assign 'inputs' list with these Nodes' Ids. 
        - If Node doest not receive any input from another, just let its 'inputs' empty.
        ---
        Markdoc:
        {{ text }}
        ---
        Agents:
        {{ agents }}
        ---
        {{ ctx.output_format }}
    "#
}

function ParseBFlowToBFlowViz2(bflow: string) -> BFlowViz {
    client Ollama_Code
    prompt #"
        You are an expert in Markdoc, Behavior Tree, and JSON processing.
        
        Task 1: Flatten JSON into Array of Objects
            Flatten the nested JSON tree into an array of objects, starting from the root.
            Assign a unique random 10-character string as id to each node.
            Add a parentNodeId field (null if no parent).
            Add a level field to each node (0 for the root, 1 for children of the root, and so on).
            Ensure each node has a position field.
            If node type is ACTION, keep its name.
            
        Task 2: Generate Parent-Child Relationships as edges
            Create an array of objects representing parent-child relationships with:
                id: A unique random 10-character string, can not be null.
                source: The parentNodeId of the child.
                target: The id of the child.

        Return only the final results for each task—no extra explanations.
        ---
        {{ bflow }}
        ---
        {{ ctx.output_format }}
    "#
}

test Test_WithoutAssignedIds_ParseMarkdocBFlowElementToBFlow {
    functions [ParseMarkdocBFlowElementToBFlow]
    args {
        text #"
            {% b-flow id="select-baking-machines" %}
                {% sequence %}                    
                    {% get-text %}
						Get List of all Machines from: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-list.md
                    {% /get-text %}

                    {% filter-data %}
                        Filter the List of Machines for having Availability as 'available'.
                    {% /filter-data %}

                    {% get-text %}
                        Get Machine Selection Processes from: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-selection.md
                    {% /get-text %}

                    {% select-machine %}
						Select the best suitable Machines for Customer, based on the filtered Machines and the Selection Process: for baking Brownies and Muffins.
                    {% /select-machine %}
                {% /sequence %}
            {% /b-flow %}
        "#,
        agents [
            {
                name "download-file"
                description "Can be use for fetching file from a given URL."
            }
            {
                name "generate-code"
                description "Depending on the given instructions, can generate the code in Javascript for excuting the task ad hoc."
            }
        ]
    }
}

test Test_ParseBFlowToBFlowViz {
    functions [ParseBFlowToBFlowViz2]
    args {
        bflow #"
            {
                "id": null,
                "name": null,
                "description": null,
                "root": {
                    "type": "SEQUENCE",
                    "id": "prepare_data",
                    "name": null,
                    "description": "1. Getting List of all Machine Models and corresponding Infos.\n2. Converting Selection Logic to a Behavioral Flow to both enable AI-based Decision Making, and explain the Choices made to Human.",
                    "config": null,
                    "state": null,
                    "goto": [
                        {
                            "type": "ACTION",
                            "id": null,
                            "name": "get-text",
                            "description": null,
                            "config": {
                                "yaml": "{url: https://cleverflow.ai/use-cases/machinery/machines-list.md}"
                            },
                            "state": null,
                            "goto": [],
                            "agent": {
                                "name": "markdoc-custom-element-to-bflow",
                                "instructions": "SMELL: TODO"
                            },
                            "inputs": [],
                            "output": null
                        },
                        {
                            "type": "ACTION",
                            "id": null,
                            "name": "get-bflow",
                            "description": null,
                            "config": {
                                "yaml": "{url: https://cleverflow.ai/use-cases/machinery/machines-selection.md}"
                            },
                            "state": null,
                            "goto": [],
                            "agent": {
                                "name": "markdoc-custom-element-to-bflow",
                                "instructions": "SMELL: TODO"
                            },
                            "inputs": [],
                            "output": null
                        },
                        {
                            "type": "SEQUENCE",
                            "id": "test",
                            "name": null,
                            "description": null,
                            "config": null,
                            "state": null,
                            "goto": [
                                {
                                    "type": "ACTION",
                                    "id": null,
                                    "name": "get-bflow",
                                    "description": null,
                                    "config": {
                                        "yaml": "{url: https://cleverflow.ai/use-cases/machinery/machines-selection2.md}"
                                    },
                                    "state": null,
                                    "goto": [],
                                    "agent": {
                                        "name": "markdoc-custom-element-to-bflow",
                                        "instructions": "SMELL: TODO"
                                    },
                                    "inputs": [],
                                    "output": null
                                },
                                {
                                    "type": "ACTION",
                                    "id": null,
                                    "name": "get-bflow",
                                    "description": null,
                                    "config": {
                                        "yaml": "{url: https://cleverflow.ai/use-cases/machinery/machines-selection3.md}"
                                    },
                                    "state": null,
                                    "goto": [],
                                    "agent": {
                                        "name": "markdoc-custom-element-to-bflow",
                                        "instructions": "SMELL: TODO"
                                    },
                                    "inputs": [],
                                    "output": null
                                }
                            ],
                            "agent": null,
                            "inputs": [
                                "get-bflow"
                            ],
                            "output": null
                        }
                    ],
                    "agent": null,
                    "inputs": [],
                    "output": null
                }
            }
        "#
    }
}