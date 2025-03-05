import MarkdocCustomElementToBFlowAgent from "../../src/bflow/MarkdocCustomeElementToBFlowAgent.js";

const agent = new MarkdocCustomElementToBFlowAgent();
const out = await agent.process({ 
    text: `
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
    `,
    agents: [
        { name: 'fetch-data', description: 'getting data via URL' },
        { name: 'generate-code-for-processing', description: 'default agent' }
    ]
});

console.log(JSON.stringify(out));