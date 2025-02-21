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

class BFlowNodeOutput {
}

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

class BFlowJsonNode {
    type BFlowNodeType
    id string?
    name string?
    description string?
    parentId string?
    config BFlowNodeConfig?
    position Position
}

class Position {
    x int
    y int
}

class BFlowJsonEdge{
    id string?
    source string?
    target string?
}

class BFlowViz{
    nodes BFlowJsonNode[]
    edges BFlowJsonEdge[]
}

function ParseMarkdocBFlowElementToBFlow(text: string, agents: string) -> BFlow {
    client Ollama_Default
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
        
        Task 1: Flatten JSON & Compute Tree Layout
            Flatten the nested JSON tree into an array of objects, starting from the root.
            Assign a unique random 10-character string as id to each node.
            Add a parentId field (null if no parent).
            Add a level field to each node (0 for the root, 1 for children of the root, and so on).
            Ensure each node has a position field with a default value of { x: 150, y: 150 } if missing.
        
        Task 2: Generate Parent-Child Relationships
            Create an array of objects representing parent-child relationships with:
                id: A unique random 10-character string, can not be null.
                source: The parentId of the child.
                target: The id of the child.
        
        Task 3: 
            You have an array of nodes, where each node has an `id` and a `parentId` to define parent-child relationships.  

            Your task is to **layout these nodes as a tree**, ensuring a well-balanced structure.  
            Use the **Reingold-Tilford tree layout algorithm** (or an equivalent tree layout algorithm) to arrange nodes optimally.  

            #### **Rules for Layout:**
            1. **Vertical Spacing**: Each level should be **150px apart downward**.  
            2. **Horizontal Spacing**:  
            - Sibling nodes should be spaced **150px apart** horizontally.  
            - Parents must be **centered horizontally above their children**.  
            3. Ensure that nodes **do not overlap** and are evenly distributed.  

            #### **Expected Output Format:**  
            Each node should contain:
            - `"level"`: The depth level (`0` for root, `1` for children of root, etc.).  
            - `"position"`: `{ "x": value, "y": value }`, calculated using the tree layout algorithm.  

            #### **Example Output (Balanced Tree Layout):**
            ```json
            [
                {
                    "type": "SEQUENCE",
                    "id": "prepare_data",
                    "level": 0,
                    "position": { "x": 0, "y": 0 }
                },
                {
                    "type": "ACTION",
                    "id": "action_1",
                    "parentId": "prepare_data",
                    "level": 1,
                    "position": { "x": -75, "y": 150 }
                },
                {
                    "type": "ACTION",
                    "id": "action_2",
                    "parentId": "prepare_data",
                    "level": 1,
                    "position": { "x": 75, "y": 150 }
                },
                {
                    "type": "ACTION",
                    "id": "action_3",
                    "parentId": "action_1",
                    "level": 2,
                    "position": { "x": -150, "y": 300 }
                },
                {
                    "type": "ACTION",
                    "id": "action_4",
                    "parentId": "action_1",
                    "level": 2,
                    "position": { "x": 0, "y": 300 }
                }
            ]

        
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
        agents #"
            [
                { 
                    "name": "download-file",
                    "instructions": 'Can be use for fetching file from a given URL.'
                },
                { 
                    "name": "generate-code",
                    instructions: 'Depending on the given instructions, can generate the code in Javascript for excuting the task ad hoc.'
                }
            ]
        "#
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
    }
}

test Test_ParseBFlowToBFlowViz {
    functions [ParseBFlowToBFlowViz]
    args {
        bflow #"
            {
                "id": "prepare_data",
                "name": null,
                "description": null,
                "root": {
                    "type": "SEQUENCE",
                    "id": null,
                    "name": null,
                    "description": null,
                    "config": null,
                    "state": null,
                    "goto": [
                        {
                            "type": "ACTION",
                            "id": "action_1",
                            "name": "get-text",
                            "description": "1. Getting List of all Machine Models and corresponding Infos.",
                            "config": {
                                "yaml": "url: https://cleverflow.ai/use-cases/machinery/machines-list.md"
                            },
                            "state": null,
                            "goto": []
                        },
                        {
                            "type": "ACTION",
                            "id": "action_2",
                            "name": "get-bflow",
                            "description": "2. Converting Selection Logic to a Behavioral Flow to both \n                enable AI-based Decision Making, \n                and explain the Choices made to Human.",
                            "config": {
                                "yaml": "url: https://cleverflow.ai/use-cases/machinery/machines-selection.md"
                            },
                            "state": null,
                            "goto": []
                        }
                    ]
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