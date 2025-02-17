class BFlow {
    id string?
    name string?
    description string?
    root BFlowNode
}

class BFlowNode {
    type "ENTRY" | "FAILBACK" | "SEQUENCE" | "PARALLEL" | "CONDITION" | "ACTION"
    id string?
    name string?
    description string?
    goto BFlowNode[]
}

function ParseMarkdocBFlowElementToBFlow(text: string) -> BFlow {
    client Ollama_Default
    prompt #"
        You are expert in Markdoc and Behavior Tree.
        You consider my given Mardoc custom element which represents a Behavior Tree with different node types such as "sequence", "action", etc. 
        Please convert the given element with its children to a JSON format.
        Just result and no verbose please!
        
        It is noted that:
        - The Behavior Tree's root node is always an ENTRY node. 
        - Please automatically create an ENTRY node and set it as the root node of the Behavior Tree.
        - The first found Markdoc element is added to 'goto' of the ENTRY node.
        - If Markdoc entry name is not <% entry %>, <% fallback %>, <% sequence %>, <% parallel %>, or <% condition %>, then it is an ACTION node.
        - If there is any text locating before the Markdoc element, than extract it as the description of the corresponding node.
        - If it is about ACTION node, the name of the node corresponds to the name of the Markdoc element.
           - For example: '<% get-text %>' must be converted to { type: "ACTION", name: "get-text" }
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