<script lang="ts">
    import { Pencil, Eye, Loader, CircleX, Check, Zap } from "lucide-svelte";
    import { onMount } from "svelte";

    let markdoc = `
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
    `;

    onMount(async () => {
        await import(
            "@cleverflow/cleverflow.core/webcomponents/markdoc-renderer.js"
        );
    });
</script>

<markdoc-renderer {markdoc} />
