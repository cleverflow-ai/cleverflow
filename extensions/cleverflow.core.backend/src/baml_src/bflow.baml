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

class BFlowNode {
    type BFlowNodeType
    id string?
    name string?
    description string?
    config BFlowNodeConfig?
    state BFlowNodeState?
    goto BFlowNode[]
}

class BFlowNodeConfig {
    yaml string?
}

class BFlowJsonNode{
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

class BFlowData{
    nodes BFlowJsonNode[]
    edges BFlowJsonEdge[]
}

function ParseMarkdocBFlowElementToBFlow(text: string) -> BFlow {
    client Ollama_Tool
    prompt #"
        You are expert in Markdoc and Behavior Tree.
        You consider my given Mardoc custom element which represents a Behavior Tree with different node types such as "sequence", "action", etc. 
        Please convert the given element with its children to a JSON format.
        Just result and no verbose please!
        
        It is noted that:
        - The Behavior Tree's root node is always an ENTRY node. 
        - Please automatically create an ENTRY node and set it as the root node of the Behavior Tree.
        - The first Markdoc element is added to 'goto' of the ENTRY node.
        - If Markdoc entry name is not <% entry %>, <% fallback %>, <% sequence %>, <% parallel %>, or <% condition %>, then it is an ACTION node.
        - If there is any text locating before the Markdoc element, than extract it as the description of the corresponding node.
        - If it is about ACTION node, the name of the node corresponds to the name of the Markdoc element.
           - For example: '<% get-text %>' must be converted to { type: "ACTION", name: "get-text" }
        - Each Markdoc element might contain YAML-based configuration between opening and closing tags: please extract the whole YAML as config of the corresponding node, no matter YAML contains only one key-value pair or multiple key-value pairs.
        ---
        {{ text }}
        ---
        {{ ctx.output_format }}
    "#
}

function ParseMarkdocBFlowElementToBFlowData(text: string) -> BFlowData {
    client Ollama_Default
    prompt #"
        You are an expert in Markdoc, Behavior Tree, and JSON processing.

        Task 1: Convert Markdoc to JSON
            Given a Markdoc custom element representing a Behavior Tree, convert it into JSON format.
            The root node is always an ENTRY node, which should be automatically created.
            The first Markdoc element should be added to the goto field of the ENTRY node.
            Node classification:
                <% entry %>, <% fallback %>, <% sequence %>, <% parallel %>, <% condition %> → Keep their types.
                Any other Markdoc element → Convert to ACTION (e.g., <% get-text id="action_1" %> → { id: ramdom, type: "ACTION", config: { id: "action_1", name: "get-text"} }).
            If there is any text locating before the Markdoc custom element, then set it as the description of this node which is below the text.
        
        Task 2: Flatten JSON & Compute Tree Layout
            Flatten the nested JSON tree into an array of objects, starting from the root.
            Assign a unique random id to each node.
            Add a parentId field (null if no parent).
            Ensure each node has a position field { x, y } (default { 0, 0 } if missing).
            Layout rules:
                Each level is 150px apart vertically.
                Sibling nodes are 150px apart horizontally.
                Parent nodes should be centered above their children.
        
        Task 3: Generate Parent-Child Relationships
            Create an array of objects representing parent-child relationships with:
                id: A unique random 10-character string.
                source: The parentId of the child.
                target: The id of the child.
        
        Return only the final results for each task—no extra explanations.
        ---
        {{ text }}
        ---
        {{ ctx.output_format }}
    "#
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
        "#
    }
}

test Test_ParseMarkdocBFlowElementToBFlowData {
    functions [ParseMarkdocBFlowElementToBFlowData]
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

test Test_WithEntry_ParseMarkdocBFlowElementToBFlowData {
    functions [ParseMarkdocBFlowElementToBFlowData]
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