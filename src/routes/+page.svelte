<script lang="ts">
  import { Tabs } from "@skeletonlabs/skeleton-svelte";
  import {
    Pencil,
    Eye,
    Loader,
    CircleX,
    Check,
    Zap,
    Container,
    TriangleAlert,
  } from "lucide-svelte";
  import { onMount } from "svelte";
  import MarkdocRendererController from "@cleverflow-ai/cleverflow.core.frontend/webcomponents/markdoc-renderer-controller.js";
  // import GitBrowser from "$lib/components/GitBrowser.svelte";
  import GitSettings from "$lib/components/GitSettings.svelte";
  import GitService from "$lib/services/GitService.svelte.js";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";

  const conductorServerUrl = import.meta.env.VITE_A2A_CONDUCTOR_SERVER;

  const currentTheme = "crimson";

  type TabType = "workspace" | "editor" | "viewer";

  let tab: TabType = $state<TabType>("workspace");

  let gitService: GitService = new GitService();
  let isGitServiceUnavailable = $state(false);
  let gitErrorMessage = $state("");
  let isLoadingFileContent = $state(false);

  let markdocRendererController: MarkdocRendererController | null =
    $state(null);

  // svelte-ignore non_reactive_update
  let markdocEditorElement: any;

  let markdoc = $state(``);
  let isMarkdocFromGit = $state(false);
  let originalContentSHA1: any = null;

  onMount(async () => {
    await import(
      "@cleverflow-ai/cleverflow.core.frontend/webcomponents/markdoc-editor.js"
    );
    await import(
      "@cleverflow-ai/cleverflow.core.frontend/webcomponents/markdoc-renderer.js"
    );

    markdocRendererController = new MarkdocRendererController(
      conductorServerUrl,
    );

    markdocRendererController.setMarkdoc(markdoc);
  });

  const switchToView = () => {
    markdoc = markdocEditorElement.getMarkdown();
    markdocRendererController?.setMarkdoc(markdoc);
    tab = "viewer";
  };

  const getFileContent = async () => {
    isLoadingFileContent = true;
    isGitServiceUnavailable = false;
    if (!gitService.isReady()) {
      isGitServiceUnavailable = true;
      isLoadingFileContent = false;
      return;
    }

    try {
      markdoc = await gitService.getFileContents();
      markdocEditorElement.setMarkdown(markdoc);
      isMarkdocFromGit = true;
      originalContentSHA1 = await sha1(markdoc);
    } catch (exception: any) {
      gitErrorMessage = exception.message ?? "Get File Contents Error: Unknown";
    }
    isLoadingFileContent = false;
  };

  const saveFileContents = async () => {
    markdoc = markdocEditorElement.getMarkdown();
    console.log(markdoc);
    const result = await gitService.saveFileContents(markdoc);
    console.log(`>>>> result: ${result}`);
  };

  const hasFileChanged = async () => {
    const fileContentSHA1 = await sha1(markdoc);
    return fileContentSHA1 !== originalContentSHA1;
  };

  const sha1 = async (content: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    return [...new Uint8Array(hashBuffer)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
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
        tab = e.value as TabType;
        if (e.value === "viewer") {
          switchToView();
        }
      }}
    >
      {#snippet list()}
        <Tabs.Control
          value="workspace"
          stateActive="border-b-primary-500 border-b-[3px]"
        >
          <div class="flex justify-center items-center gap-2">
            <Container class="w-6 h-6" />
            <span>Workspace</span>
          </div>
        </Tabs.Control>
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
        <Tabs.Panel value="workspace" base="my-4 h-full">
          <div class="w-full h-full">
            <!-- <GitBrowser></GitBrowser> -->
            <GitSettings {gitService}></GitSettings>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="editor" base="my-4 h-full">
          <div class="w-full h-full flex flex-col gap-2">
            <div class="flex justify-start items-center gap-3">
              <!-- svelte-ignore a11y_label_has_associated_control -->
              <div class="text-sm font-medium">File Path</div>
              <input
                type="text"
                bind:value={gitService.path}
                class="flex-1 border px-2 py-1"
              />
              {#if !isLoadingFileContent}
                <button
                  onclick={() => getFileContent()}
                  disabled={gitService.path ? false : true}
                  type="button"
                  class="btn preset-filled-primary-500">Load</button
                >
                <button
                  onclick={async () => await saveFileContents()}
                  disabled={gitService.path ? false : true}
                  type="button"
                  class="btn preset-filled-primary-500">Save</button
                >
              {:else}
                <div>
                  <LoadingIndicator size={30}></LoadingIndicator>
                </div>
              {/if}
            </div>
            {#if isGitServiceUnavailable || gitErrorMessage}
              <div
                class="items-center gap-3 flex justify-center items-center text-warning-500"
              >
                <TriangleAlert class="w-7 h-7" />
                <div>
                  {#if isGitServiceUnavailable}
                    <p>Git service is not available.</p>
                  {:else}
                    <p>{gitErrorMessage}</p>
                  {/if}
                </div>
                {#if isGitServiceUnavailable}
                  <button
                    onclick={() => (tab = "workspace")}
                    type="button"
                    class="btn preset-tonal-surface">Go to setting</button
                  >
                {/if}
              </div>
            {/if}

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
                  onclick={() => (tab = "viewer")}
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
