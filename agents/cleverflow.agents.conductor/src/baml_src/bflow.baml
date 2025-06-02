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
        - The Tree / each Node needs a Unique Id. If there is no id given in the Markdoc element, assign it with a unique id which can be constructed with its name and its appearing order.
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

function ParseBFlowToBFlowViz(bflow: string) -> BFlowViz {
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
        // agents [
        //     {
        //         name "download-file"
        //         description "Can be use for fetching file from a given URL."
        //     }
        //     {
        //         name "generate-code"
        //         description "Depending on the given instructions, can generate the code in Javascript for excuting the task ad hoc."
        //     }
        // ]
        agents [
            {
                name "markdoc-custom-element-to-bflow",
                description "Parse given Markdoc Custome Element (as Text) to B-Flow.",
                instructions "SMELL: TODO"
            }
            {
                name "bflow-to-bflowviz",
                description "Parse given B-Flow to the Visualization Format.",
                instructions "SMELL: TODO"
            }
            {
                name "js-v8-code-generation",
                description "\n                Generate Javascript (V8) code for executing Task ad hoc.\n                Can be used as default Agent.\n            ",
                instructions "SMELL: TODO"
            }
            {
                name "bflow-runner",
                description "Run the given B-Flow.",
                instructions "SMELL: TODO"
            }
        ]
    }
}

test Test_ParseBFlowToBFlowViz {
    functions [ParseBFlowToBFlowViz]
    args {
        bflow #"
            {
                "id": "cleverflow-mcp-a2a",
                "name": "cleverflow-mcp-a2a",
                "description": null,
                "root": {
                    "type": "SEQUENCE",
                    "id": "sequence_0",
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
                            "agent": {
                                "name": "js-v8-code-generation",
                                "description": "\n                Generate Javascript (V8) code for executing Task ad hoc.\n                Can be used as default Agent.\n            "
                            },
                            "inputs": [],
                            "output": null
                        },
                        {
                            "type": "ACTION",
                            "id": "action_2",
                            "name": "outline-file-fetching",
                            "description": "Fetching a outline file",
                            "config": null,
                            "state": null,
                            "goto": null,
                            "agent": {
                                "name": "js-v8-code-generation",
                                "description": "\n                Generate Javascript (V8) code for executing Task ad hoc.\n                Can be used as default Agent.\n            "
                            },
                            "inputs": [],
                            "output": null
                        },
                        {
                            "type": "ACTION",
                            "id": "action_3",
                            "name": "convert-steps-to-glb",
                            "description": "Convert a steps file to glb",
                            "config": null,
                            "state": null,
                            "goto": null,
                            "agent": {
                                "name": "js-v8-code-generation",
                                "description": "\n                Generate Javascript (V8) code for executing Task ad hoc.\n                Can be used as default Agent.\n            "
                            },
                            "inputs": [],
                            "output": null
                        }
                    ],
                    "agent": null,
                    "inputs": null,
                    "output": null
                }
            }
        "#
    }
}