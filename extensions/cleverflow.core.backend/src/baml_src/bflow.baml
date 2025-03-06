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
}

class BFlowNodeConfig {
  yaml string?
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
  config BFlowNodeConfig?
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
  config BFlowNodeConfig?
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
        - If there is any text locating before the Markdoc element, than extract it as the description of the corresponding node.
        - The Tree / each Node needs a Unique Id. If there is no Id given in the Markdoc element, assign it with a unique Id which can be constructed with its name and its appearing sequennce.
        - If it is about ACTION node, the name of the node corresponds to the name of the Markdoc element.
           - For example: '<% get-text %>' must be converted to { type: "ACTION", name: "get-text" }
        - Each Markdoc element might contain YAML-based configuration between opening and closing tags: please extract the whole YAML as config of the corresponding node, no matter YAML contains only one key-value pair or multiple key-value pairs.
        - If markdoc element contains children, then they should be added to the 'goto' field of the nearest father node.
        - Each Node with type 'ACTION' or 'CONDITION' needs a corresponding Agent given in the Agents list. If you cannot decide which Agent to assign, just assign the default one.
        - Go thruogh each Node, identity the names of other Nodes whose outputs are the inputs for it. Assign 'inputs' list with these Nodes' Ids. 
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
    client Ollama_Tool
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
            {% b-flow %}
                {% sequence %}
                    1. Get List of all Machine Models and corresponding Infos:
                    {% get-text %}
                        url: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-list.md
                    {% /get-text %}

                    2. Filter the List of Machines:
                    {% filter-data %}
                        filter: only lines having Availability as 'available'.
                    {% /filter-data %}

                    3. Get Machine Selection Processes:
                    {% get-text %}
                        url: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-selection.md
                    {% /get-text %}

                    4. Select the best suitable Machines for Customer:
                    {% select-machine %}
                        conditions: can bake Brownies and Muffins.
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

test Test_WithAssignedIds_ParseMarkdocBFlowElementToBFlow {
    functions [ParseMarkdocBFlowElementToBFlow]
    args {
        text #"
            {% b-flow id="select_baking_machine" %}
                {% sequence %}
                    1. Get List of all Machine Models and corresponding Infos:
                    {% get-text id="action_1" %}
                        url: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-list.md
                    {% /get-text %}

                    2. Filter the List of Machines:
                    {% filter-data id="action_2" %}
                        filter: only lines having Availability as 'available'.
                    {% /filter-data %}

                    3. Get Machine Selection Processes:
                    {% get-text id="action_3" %}
                        url: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-selection.md
                    {% /get-text %}

                    4. Select the best suitable Machines for Customer:
                    {% select-machine id="action_4" %}
                        conditions: can bake Brownies and Muffins.
                    {% /select-machine %}
                {% /sequence %}
            {% /b-flow %}
        "#
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