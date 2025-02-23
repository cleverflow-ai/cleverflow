class BFlow {
  id string?
  name string?
  description string?
  root BFlowNode
}

enum BFlowNodeType {
    ENTRY
    FAILBACK
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
  instructions string
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
  name string?
  description string?
  parentId string?
  position Position
  config BFlowNodeConfig?
  dimension Dimension
  level int
}

class Position {
  x int
  y int
}

class Dimension {
  width int
  height int
}

class BFlowVizEdge {
  id string
  source string
  target string
}

class BFlowVizNodeData {
  id string?
  name string?
  description string?
  config BFlowNodeConfig?
  dimension Dimension
  level int
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
        - If it is about ACTION node, the name of the node corresponds to the name of the Markdoc element.
           - For example: '<% get-text %>' must be converted to { type: "ACTION", name: "get-text" }
        - Each Markdoc element might contain YAML-based configuration between opening and closing tags: please extract the whole YAML as config of the corresponding node, no matter YAML contains only one key-value pair or multiple key-value pairs.
        - If markdoc element contains children, then they should be added to the 'goto' field of the nearest father node.
        - Each Node with type 'ACTION' or 'CONDITION' might need a corresponding Agent given in the Agents list.
        - Go thruogh each Node, identity the names of other Nodes whose outputs are the inputs for it. Assign 'inputs' list with these Nodes names. 
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
    client Ollama_Default
    prompt #"
        You are an expert in Markdoc, Behavior Tree, and JSON processing.
        
        Task 1: Flatten JSON into Array of Objects
            Flatten the nested JSON tree into an array of objects, starting from the root.
            Assign a unique random 10-character string as id to each node.
            Add a parentId field (null if no parent).
            Add a level field to each node (0 for the root, 1 for children of the root, and so on).
            Ensure each node has a position field.
            
        
        Task 2: Layout Nodes as a Tree
            You have an array of nodes, where each node has an `id` and a `parentId` to define parent-child relationships.  

            Your task is to **layout these nodes as a tree**, ensuring a well-balanced structure.  

            ### **Node Dimensions:**
                - Each node is **150 wide** and **30 tall**.

            ### **Rules for Layout:**
                1. **Vertical Spacing:**  
                    - Each level should be **at least 20 apart downward**, ensuring enough space for nodes.  
                2. **Horizontal Spacing:**  
                    - Nodes **at the same level must be horizontally aligned**.  
                    - Nodes **at the same level must be at least 20 apart** from each other.  
                    - Parent nodes must be **centered horizontally above their children**.  
                    - Nodes should be placed without overlapping and should be evenly distributed.
            
            Using following functions to update all node's position

                function buildTree(nodes) {
                    const nodeMap = new Map();
                    const rootNodes = [];

                    // Tạo map để tra cứu node theo id
                    nodes.forEach(node => nodeMap.set(node.id, { ...node, children: [] }));

                    // Gán children vào parent
                    nodes.forEach(node => {
                        if (node.parentId !== null) {
                            nodeMap.get(node.parentId).children.push(nodeMap.get(node.id));
                        } else {
                            rootNodes.push(nodeMap.get(node.id));
                        }
                    });

                    return rootNodes;
                }

                function calculatePositions(nodes, startX = 0, startY = 0, xGap = 20, yGap = 5) {
                    let xOffset = startX;
                    let yOffset = startY;

                    function layout(node, depth = 0) {
                        let children = node.children;
                        let width = node.dimension.width;
                        let height = node.dimension.height;

                        // Nếu không có con, đặt node ở vị trí hiện tại
                        if (children.length === 0) {
                            node.position.x = xOffset;
                            node.position.y = yOffset + depth * (height + yGap);
                            xOffset += width + xGap;
                            return node.position.x;
                        }

                        // Định vị các con
                        let childXPositions = children.map(child => layout(child, depth + 1));

                        // Đặt cha nằm giữa các con
                        let minX = Math.min(...childXPositions);
                        let maxX = Math.max(...childXPositions);
                        node.position.x = (minX + maxX) / 2;
                        node.position.y = yOffset + depth * (height + yGap);

                        return node.position.x;
                    }

                    nodes.forEach(node => layout(node));
                }

                const tree = buildTree(nodes);
                calculatePositions(tree);
            
        Task 3: Generate Parent-Child Relationships
            Create an array of objects representing parent-child relationships with:
                id: A unique random 10-character string, can not be null.
                source: The parentId of the child.
                target: The id of the child.

        Return only the final results for each task—no extra explanations.
        ---
        {{ bflow }}
        ---
        {{ ctx.output_format }}
    "#
}

test Test_WithEntry_ParseMarkdocBFlowElementToBFlow {
    functions [ParseMarkdocBFlowElementToBFlow]
    args {
        text #"
            {% b-flow id="choose_machine_models" %}
                {% entry %}
                {% /entry %}

                {% sequence %}
                    1. Going through the Selection Process, which is described in the following Document.
                    {% reason-with-bflow id="action_1" %}
                        instructions: |
                            Select corresponding Machine Models based on the requested Cake Types and the given Behavior Tree prepare_data.action_2.
                    {% /reason-with-bflow %}

                    2. Setting any filter rule e.g. filter out those Machine Models are not available
                    {% filter id="action_2" %}
                        instructions: |
                            Use the data from prepare_data.action_1 and select the Machine Models which are given by choose_machine_model.action_1.
                            Filter out the selected Machine Models with the given conditions.
                            If there is no given condition, then we can skip this step.
                    {% /filter %}

                    3. Displaying the result as Table. Each row contains a concrete Machine Model.
                    {% display-table id="action_3" %}
                    {% /display-table %}
                {% /sequence %}
            {% /b-flow %}
        "#,
        agents [
            {
                name "download-file"
                instructions "Can be use for fetching file from a given URL."
            }
            {
                name "generate-code"
                instructions "Depending on the given instructions, can generate the code in Javascript for excuting the task ad hoc."
            }
        ]
    }
}

test Test_WithoutEntry_ParseMarkdocBFlowElementToBFlow {
    functions [ParseMarkdocBFlowElementToBFlow]
    args {
        text #"
            {% b-flow id="prepare_data" %}
                {% sequence %}
                    1. Getting List of all Machine Models and corresponding Infos.
                    {% get-text id="action_1" %}
                        url: https://cleverflow.ai/use-cases/machinery/machines-list.md
                    {% /get-text %}

                    2. Converting Selection Logic to a Behavioral Flow to both 
                    enable AI-based Decision Making, 
                    and explain the Choices made to Human.
                    {% get-bflow id="action_2" %}
                        url: https://cleverflow.ai/use-cases/machinery/machines-selection.md
                    {% /get-bflow %}
                    
                {% /sequence %}
            {% /b-flow %}
        "#
        agents [
            {
                name "download-file"
                instructions "Can be use for fetching file from a given URL."
            }
            {
                name "generate-code"
                instructions "Depending on the given instructions, can generate the code in Javascript for excuting the task ad hoc."
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
                                "name": "download-file",
                                "instructions": "Can be use for fetching file from a given URL."
                            },
                            "inputs": [],
                            "output": null
                        },
                        {
                            "type": "ACTION",
                            "id": "action_2",
                            "name": "get-bflow",
                            "description": null,
                            "config": {
                                "yaml": "{url: https://cleverflow.ai/use-cases/machinery/machines-selection.md}"
                            },
                            "state": null,
                            "goto": [],
                            "agent": {
                                "name": "generate-code",
                                "instructions": "Depending on the given instructions, can generate the code in Javascript for excuting the task ad hoc."
                            },
                            "inputs": [],
                            "output": null
                        },
                        {
                            "type": "SEQUENCE",
                            "id": "test",
                            "name": null,
                            "description": "3. Converting Selection Logic to a Behavioral Flow to both enable AI-based Decision Making, and explain the Choices made to Human.",
                            "config": null,
                            "state": null,
                            "goto": [
                                {
                                    "type": "ACTION",
                                    "id": "action_3",
                                    "name": "get-bflow",
                                    "description": null,
                                    "config": {
                                        "yaml": "{url: https://cleverflow.ai/use-cases/machinery/machines-selection2.md}"
                                    },
                                    "state": null,
                                    "goto": [],
                                    "agent": {
                                        "name": "generate-code",
                                        "instructions": "Depending on the given instructions, can generate the code in Javascript for excuting the task ad hoc."
                                    },
                                    "inputs": [],
                                    "output": null
                                },
                                {
                                    "type": "ACTION",
                                    "id": "action_4",
                                    "name": "get-bflow",
                                    "description": null,
                                    "config": {
                                        "yaml": "{url: https://cleverflow.ai/use-cases/machinery/machines-selection3.md}"
                                    },
                                    "state": null,
                                    "goto": [],
                                    "agent": {
                                        "name": "generate-code",
                                        "instructions": "Depending on the given instructions, can generate the code in Javascript for excuting the task ad hoc."
                                    },
                                    "inputs": [],
                                    "output": null
                                }
                            ],
                            "agent": null,
                            "inputs": [
                                "action_3",
                                "action_4"
                            ],
                            "output": null
                        }
                    ],
                    "agent": null,
                    "inputs": [
                        "action_2"
                    ],
                    "output": null
                }
            }
        "#
    }
}

test Test_WithEntry_ParseBFlowToBFlowViz {
    functions [ParseBFlowToBFlowViz]
    args {
        text #"
            {% b-flow id="choose_machine_models" %}
                {% entry %}
                {% /entry %}

                {% sequence %}
                    1. Going through the Selection Process, which is described in the following Document.
                    {% reason-with-bflow id="action_1" %}
                        instructions: |
                            Select corresponding Machine Models based on the requested Cake Types and the given Behavior Tree prepare_data.action_2.
                    {% /reason-with-bflow %}

                    2. Setting any filter rule e.g. filter out those Machine Models are not available
                    {% filter id="action_2" %}
                        instructions: |
                            Use the data from prepare_data.action_1 and select the Machine Models which are given by choose_machine_model.action_1.
                            Filter out the selected Machine Models with the given conditions.
                            If there is no given condition, then we can skip this step.
                    {% /filter %}

                    3. Displaying the result as Table. Each row contains a concrete Machine Model.
                    {% display-table id="action_3" %}
                    {% /display-table %}
                {% /sequence %}
            {% /b-flow %}
        "#
    }
}