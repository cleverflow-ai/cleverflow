<script lang="ts">
    import { onMount } from "svelte";
    import MarkdocRendererController from "@cleverflow/cleverflow.core/webcomponents/markdoc-renderer-controller.js";

    let markdoc = `
---
title: What is Markdoc?
---
Markdoc is open-source—check out its [source](http://github.com/markdoc/markdoc) to see how it works.
# {% $markdoc.frontmatter.title %} {% #overview %}

## How is Markdoc different?

{% b-flow id="select_baking_machine1" %}
{% sequence %}
1. Get List of all Machine Models and corresponding Infos.
{% get-text id="action_1" %}
url: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-list.md
{% /get-text %}

2. Filter the List of Machines, to get only those Available:
{% filter-data id="action_2" %}
filter: only lines having Availability as 'available'.
{% /filter-data %}

3. Get Machine Selection Processes
{% get-text id="action_3" %}
url: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-selection.md
{% /get-text %}

4. Select the best suitable Machines for Customer
{% select-machine id="action_4" %}
conditions: can bake Brownies and Muffins.
{% /select-machine %}
{% /sequence %}
{% /b-flow %}

{% b-flow id="select_baking_machine" %}
{% sequence %}
1. Get List of all Machine Models and corresponding Infos.
{% get-text id="action_1" %}
url: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-list.md
{% /get-text %}

2. Filter the List of Machines, to get only those Available:
{% filter-data id="action_2" %}
filter: only lines having Availability as 'available'.
{% /filter-data %}

3. Get Machine Selection Processes
{% get-text id="action_3" %}
url: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-selection.md
{% /get-text %}

4. Select the best suitable Machines for Customer
{% select-machine id="action_4" %}
conditions: can bake Brownies and Muffins.
{% /select-machine %}
{% /sequence %}
{% /b-flow %}

Markdoc uses a fully declarative approach to composition and flow control, where other solutions… [Read more](/docs/overview).

## Next steps
- [Install Markdoc](/docs/getting-started)
- [Explore the syntax](/docs/syntax)
`;

    let markdocRendererController = $state(null);

    onMount(async () => {
        await import(
            "@cleverflow/cleverflow.core/webcomponents/markdoc-renderer.js"
        );
        markdocRendererController = new MarkdocRendererController(
            "ws://localhost:8080",
            "76de3ba222bec3af21f9dbfb01f3197b",
            markdoc,
        );
    });
</script>

{#if markdocRendererController}
    <markdoc-renderer controller={markdocRendererController}></markdoc-renderer>
{/if}
