<script>
    import { onMount } from 'svelte';
    import * as m from '$lib/paraglide/messages.js';

    onMount(async () => {
        await import('@cleverflow/cleverflow.core/webcomponents/markdoc-editor.js');
        await import('@cleverflow/cleverflow.core/webcomponents/b-flow.js');
    });

    const bflow = `
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
    `;
</script>

<h1>{m.welcome_to_cleverflow()}</h1>

<markdoc-editor name="mydoc.mdoc"></markdoc-editor>
<b-flow url="https://cleverflow.ai/files/dummy.mdoc" text={bflow}></b-flow>