import MarkdocCustomElementToBFlowAgent from "../../src/bflow/MarkdocCustomeElementToBFlowAgent.js";

const agent = new MarkdocCustomElementToBFlowAgent();
const out = await agent.process({ 
    text: `
        {% b-flow id="prepare_data" %}
            {% sequence %}
                1. Getting List of all Machine Models and corresponding Infos.
                {% get-text id="action_1" %}
                    url: https://cleverflow.ai/use-cases/machinery/machines-list.md
                {% /get-text %}

                2. Filter the fetched List of Machines.
                {% filter-data id="action_2" %}
                    filter: only available one
                {% /filter-data %}
            {% /sequence %}
        {% /b-flow %}
    `
});

console.log(JSON.stringify(out));