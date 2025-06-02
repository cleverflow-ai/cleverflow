<script lang="ts">
  import { Tabs } from "@skeletonlabs/skeleton-svelte";
  import { Pencil, Eye, Loader, CircleX, Check, Zap } from "lucide-svelte";
  import { onMount } from "svelte";
  import MarkdocRendererController from "@cleverflow-ai/cleverflow.core.frontend/webcomponents/markdoc-renderer-controller.js";

  const eventServer = "ws://localhost:8080";
  const eventServerToken = "76de3ba222bec3af21f9dbfb01f3197b";

  const currentTheme = "crimson";
  let tab = $state("editor");

  let markdocRendererController = $state(null);

  // svelte-ignore non_reactive_update
  let markdocEditorElement: any;

  let markdoc = $state(``);

  onMount(async () => {
    await import(
      "@cleverflow-ai/cleverflow.core.frontend/webcomponents/markdoc-editor.js"
    );
    await import(
      "@cleverflow-ai/cleverflow.core.frontend/webcomponents/markdoc-renderer.js"
    );

    markdocRendererController = new MarkdocRendererController(
      eventServer,
      eventServerToken,
    );

    markdocRendererController.setMarkdoc(markdoc);
  });

  const switchToEditor = () => {
    tab = "editor";
  };

  const switchToView = () => {
    markdoc = markdocEditorElement.getMarkdown();
    markdocRendererController.setMarkdoc(markdoc);
    tab = "viewer";
  };
</script>

<main class="w-full h-screen">
  <div class="m-4">
    <Tabs
      fluid
      listBorder="border-b-surface-500 border-b-[1px]"
      listGap="gap-0"
      value={tab}
      onValueChange={(e) => {
        // tab = e.value;
        if (e.value === "viewer") {
          switchToView();
        } else {
          switchToEditor();
        }
      }}
    >
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
        <Tabs.Panel value="editor" base="my-4 h-full">
          <div class="w-full h-full">
            <markdoc-editor
              name="mydoc.mdoc"
              text={markdoc}
              theme={currentTheme}
              bind:this={markdocEditorElement}
            ></markdoc-editor>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="viewer" base="my-4 h-full">
          <div class="w-full h-full">
            {#if markdocRendererController && markdoc}
              <markdoc-renderer
                controller={markdocRendererController}
                theme={currentTheme}
              ></markdoc-renderer>
            {:else}
              <div
                class="h-screen w-full flex flex-col justify-center items-center gap-2"
              >
                <p class="text-surface-500">
                  The provided Markdoc content is invalid.
                </p>
                <button
                  class="mt-4 btn preset-tonal-surface"
                  onclick={switchToEditor}
                >
                  <Pencil class="w-5 h-5" />
                  Back to Editor
                </button>
              </div>
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
      Render
    </button>
  {/if}
</main>
