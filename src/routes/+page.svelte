<script lang="ts">
  import { Pencil, Eye, Loader, CircleX, Check, Zap } from "lucide-svelte";
  import { onMount } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
  import MarkdocRendererController from "@cleverflow/cleverflow.core/webcomponents/markdoc-renderer-controller.js";

  const eventServer = "ws://localhost:8080";
  const eventServerToken = "76de3ba222bec3af21f9dbfb01f3197b";

  let markdocRendererController = $state(null);

  let activeTab = $state("editor");
  let markdocEditorElement;

  let bflowUrl = "https://cleverflow.ai/files/dummy.mdoc";
  let markdoc = $state(``);

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
      {/if}
      <!-- {#if activeTab === "view"}
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
      {/if} -->
    </button>
  </div>

  <!-- Content -->
  <div class="flex-1 w-full">
    {#if activeTab === "editor"}
      <div class="w-full h-full">
        <markdoc-editor
          name="mydoc.mdoc"
          text={markdoc}
          bind:this={markdocEditorElement}
        ></markdoc-editor>
      </div>
    {:else}
      <div class="w-full h-full">
        {#if markdocRendererController}
          <markdoc-renderer controller={markdocRendererController} {markdoc}
          ></markdoc-renderer>
        {/if}
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
