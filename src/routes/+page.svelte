<script lang="ts">
  import { Tabs } from "@skeletonlabs/skeleton-svelte";
  import { Pencil, Eye, Loader, CircleX, Check, Zap } from "lucide-svelte";
  import { onMount } from "svelte";
  import MarkdocRendererController from "@cleverflow/cleverflow.core/webcomponents/markdoc-renderer-controller.js";

  const eventServer = "ws://localhost:8080";
  const eventServerToken = "76de3ba222bec3af21f9dbfb01f3197b";

  let tab = $state("editor");

  let markdocRendererController = $state(null);

  let activeTab = $state("editor");
  // svelte-ignore non_reactive_update
  let markdocEditorElement: any;

  let bflowUrl = "https://cleverflow.ai/files/dummy.mdoc";
  let markdoc = $state(`
  {% b-flow id="select-baking-machines" %}
    {% sequence %}                    
        {% get-text %}
Get List of all Machines from: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-list.md
        {% /get-text %}

        {% filter-data %}
            Filter the List of Machines for having Availability as 'available'.
        {% /filter-data %}

        {% get-text %}
            Get Machine Selection Processes from: https://raw.githubusercontent.com/cleverflow-ai/examples/refs/heads/main/machinery/machines-selection.md
        {% /get-text %}

        {% select-machine %}
Select the best suitable Machines for Customer, based on the filtered Machines and the Selection Process: for baking Brownies and Muffins.
        {% /select-machine %}
    {% /sequence %}
{% /b-flow %}
  `);

  onMount(async () => {
    await import("@cleverflow/cleverflow.core/webcomponents/markdoc-editor.js");
    await import(
      "@cleverflow/cleverflow.core/webcomponents/markdoc-renderer.js"
    );

    markdocRendererController = new MarkdocRendererController(
      eventServer,
      eventServerToken,
    );

    markdocRendererController.setMarkdoc(markdoc);
  });

  const switchToView = () => {
    markdoc = markdocEditorElement.getMarkdown();
    markdocRendererController.setMarkdoc(markdoc);
    activeTab = "view";
  };
</script>

<main class="w-full h-full">
  <div class="m-4">
    <Tabs value={tab} onValueChange={(e) => (tab = e.value)}>
      {#snippet list()}
        <Tabs.Control
          value="editor"
          stateActive="border-b-primary-500 border-b-[3px]"
        >
          <div class="flex justify-center items-center gap-2">
            <Pencil class="w-6 h-6" />
            <span>Editor</span>
          </div>
        </Tabs.Control>
        <Tabs.Control
          value="viewer"
          stateActive="border-b-primary-500 border-b-[3px]"
        >
          <div class="flex justify-center items-center gap-2">
            <Eye class="w-6 h-6" />
            <span>View</span>
          </div>
        </Tabs.Control>
      {/snippet}
      {#snippet content()}
        <Tabs.Panel value="editor" base="my-4">
          <div class="w-full h-full">
            <markdoc-editor
              name="mydoc.mdoc"
              text={markdoc}
              bind:this={markdocEditorElement}
            ></markdoc-editor>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="viewer" base="my-4">
          <div class="w-full h-full">
            {#if markdocRendererController}
              <markdoc-renderer
                controller={markdocRendererController}
                theme="vintage"
              ></markdoc-renderer>
            {/if}
          </div>
        </Tabs.Panel>
      {/snippet}
    </Tabs>
  </div>
  <!-- Sticky button -->
  {#if tab === "editor"}
    <button
      class="fixed bottom-5 left-1/2 -translate-x-1/2 transition btn preset-filled-primary-500"
      onclick={switchToView}
    >
      <Eye class="w-5 h-5" />
      Show
    </button>
  {/if}
</main>
