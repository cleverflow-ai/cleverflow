<script lang="ts">
  import { Pencil, Eye, Loader, CircleX, Check, Zap } from "lucide-svelte";
  import { onMount } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
  import BFlowController from "@cleverflow/cleverflow.core/webcomponents/b-flow-controller.js";

  onMount(async () => {
    await import("@cleverflow/cleverflow.core/webcomponents/markdoc-editor.js");
    await import("@cleverflow/cleverflow.core/webcomponents/b-flow.js");
  });

  let activeTab = $state("editor");
  let bflowState = $state("");
  let bflowController = $state(
    new BFlowController(
      "ws://localhost:8080",
      "76de3ba222bec3af21f9dbfb01f3197b",
      (state: string) => {
        bflowState = state;
      },
    ),
  );

  let bflowUrl = "https://cleverflow.ai/files/dummy.mdoc";
  let bflow = $state(
    `
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
    `,
  );

  // svelte-ignore non_reactive_update
  let markdocEditorElement: any = null;

  onMount(async () => {
    await bflowController.connect();
  });

  function switchToView() {
    bflow = markdocEditorElement.getMarkdown();
    activeTab = "view";
  }
</script>

<div class="flex flex-col h-screen">
  <!-- Tabs -->
  <div
    class="flex justify-center bg-gray-50 border-b border-gray-300 shadow-sm p-3 space-x-4"
  >
    <button
      class="flex items-center gap-2 px-4 py-2 text-lg font-medium transition rounded-lg relative"
      onclick={() => (activeTab = "editor")}
    >
      <Pencil class="w-5 h-5" />
      <span>Editor</span>
      {#if activeTab === "editor"}
        <span
          class="absolute bottom-0 left-0 w-full h-[3px] bg-blue-500 rounded-full"
        ></span>
      {/if}
    </button>

    <button
      class="flex items-center gap-2 px-4 py-2 text-lg font-medium transition rounded-lg relative"
      onclick={() => switchToView()}
    >
      <Eye class="w-5 h-5" />
      <span>View</span>
      {#if activeTab === "view"}
        <span
          class="absolute bottom-0 left-0 w-full h-[3px] bg-blue-500 rounded-full"
        ></span>
      {:else}
        {#key bflowState}
          {#if bflowController.isDocumentChanged(bflowUrl, bflow)}
            <Zap class="text-green-700 w-3 h-3" />
          {:else if bflowController.isStateLoading()}
            <Loader class="animate-spin w-3 h-3" />
          {:else if bflowController.isFinishedState()}
            <Check class="text-green-700 w-3 h-3" />
          {:else if bflowController.isFailedState()}
            <CircleX class="text-red-700 w-3 h-3" />
          {/if}
        {/key}
      {/if}
    </button>
  </div>

  <!-- Content -->
  <div class="flex-1 w-full">
    {#if activeTab === "editor"}
      <div class="w-full h-full">
        <markdoc-editor
          name="mydoc.mdoc"
          text={bflow}
          bind:this={markdocEditorElement}
        ></markdoc-editor>
      </div>
    {:else}
      <div class="w-full h-full">
        <b-flow url={bflowUrl} text={bflow} controller={bflowController}
        ></b-flow>
      </div>
    {/if}
  </div>

  <!-- Sticky button -->
  {#if activeTab === "editor"}
    <button
      class="fixed bottom-5 left-1/2 -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition"
      onclick={switchToView}
    >
      <Eye class="w-5 h-5" />
      Show
    </button>
  {/if}
</div>
