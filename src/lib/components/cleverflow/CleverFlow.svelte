<script lang="ts">
    import { Tabs } from "@skeletonlabs/skeleton-svelte";
    import { Pencil, Eye, Container, TriangleAlert } from "lucide-svelte";
    import { onMount } from "svelte";
    import MarkdocRendererController from "@cleverflow-ai/cleverflow.core.frontend/webcomponents/markdoc-renderer-controller.js";
    import Settings from "$lib/components/Settings.svelte";
    import ConductorService from "$lib/services/ConductorService";
    import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
    import md5 from "md5";
    import Session from "$lib/session/Session.svelte";
    import { toaster } from "$lib/components/Toast.js";
    import type { DataPart } from "@cleverflow-ai/cleverflow.agents/schema";

    let { theme = "crimson" } = $props();

    console.log(`>>> theme:  ${theme}`);

    type TabType = "workspace" | "editor" | "viewer";

    let tab: TabType = $state<TabType>("workspace");

    const session = new Session();

    let isFileLoaded = $state(false);
    let hasRequiredConfig = $state(true);
    let gitErrorMessage = $state("");
    let isLoadingFileContent = $state(false);

    let markdocRendererController: MarkdocRendererController | null =
        $state(null);

    // svelte-ignore non_reactive_update
    let markdocEditorElement: any;

    let markdoc = $state(``);

    let conductorService: ConductorService | null = null;

    let initialized = $state(false);

    onMount(async () => {
        await Promise.all([
            import(
                "@cleverflow-ai/cleverflow.core.frontend/webcomponents/markdoc-editor.js"
            ),
            import(
                "@cleverflow-ai/cleverflow.core.frontend/webcomponents/markdoc-renderer.js"
            ),
        ]);

        conductorService = new ConductorService(
            import.meta.env.VITE_A2A_CONDUCTOR_SERVER,
        );

        markdocRendererController = new MarkdocRendererController(
            // generate bflow
            async (
                text: string,
                onProgress: (state: string) => void,
                onCompleted: (result: any) => void,
                onFailed: (error: Error) => void,
            ) => {
                session.setHashedFileContent(md5(text));
                await conductorService?.generateBFlow(
                    session,
                    text,
                    onProgress,
                    onCompleted,
                    onFailed,
                );
            },
            // run bflow
            async (
                bflow: any,
                onProgress: (data: any) => void,
                onCompleted: (data: any) => void,
                onFailed: (error: Error, data: any) => void,
            ) => {
                await conductorService?.runBFlow(
                    session,
                    bflow,
                    onProgress,
                    onCompleted,
                    onFailed,
                );
            },
        );

        markdocRendererController.setMarkdoc(markdoc);

        initialized = true;
    });

    const switchToView = () => {
        markdoc = markdocEditorElement.getMarkdown();
        markdocRendererController?.setMarkdoc(markdoc);
        tab = "viewer";
    };

    const getFileContent = async () => {
        isLoadingFileContent = true;
        hasRequiredConfig = true;
        if (!session.hasRequiredConfig()) {
            hasRequiredConfig = false;
            isLoadingFileContent = false;
            return;
        }

        if (!conductorService) {
            return;
        }

        try {
            session.ensureSession();

            const event = await conductorService.getFileContents(session);
            console.log(JSON.stringify(event));
            let dataPart: DataPart = event?.status?.message?.parts?.find(
                (part) => {
                    return part.type === "data" && part.data;
                },
            ) as DataPart;

            if (dataPart && dataPart.data?.blob) {
                markdoc = atob(dataPart.data.blob as string);
                markdocEditorElement.setMarkdown(markdoc);
                session.setHashedFileContent(md5(markdoc));
                isFileLoaded = true;
                toaster.success({
                    title: "File loaded successfully.",
                });
            } else {
                toaster.error({
                    title: "File loaded failed.",
                });
            }
        } catch (exception: any) {
            gitErrorMessage =
                exception.message ?? "Get File Contents Error: Unknown";
            toaster.error({
                title: "File loaded failed.",
            });
        }
        isLoadingFileContent = false;
    };

    const saveFileContents = async () => {
        if (!conductorService) {
            return;
        }
        isLoadingFileContent = true;
        markdoc = markdocEditorElement.getMarkdown();
        console.log(markdoc);
        const result = await conductorService.saveFileContents(
            session,
            markdoc,
        );
        if (result) {
            toaster.success({
                title: "File saved successfully.",
            });
        } else {
            toaster.warning({
                title: "Failed to save file.",
            });
        }

        isLoadingFileContent = false;
    };
</script>

{#if initialized}
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
                            <Settings {session}></Settings>
                        </div>
                    </Tabs.Panel>
                    <Tabs.Panel value="editor" base="my-4 h-full">
                        <div class="w-full h-full flex flex-col gap-2">
                            <div class="flex justify-start items-center gap-3">
                                <!-- svelte-ignore a11y_label_has_associated_control -->
                                <div class="text-sm font-medium">File Path</div>
                                <input
                                    type="text"
                                    bind:value={session.path}
                                    class="flex-1 border px-2 py-1"
                                />
                                {#if !isLoadingFileContent}
                                    <button
                                        onclick={() => getFileContent()}
                                        disabled={session.hasRequiredConfig()
                                            ? false
                                            : true}
                                        type="button"
                                        class="btn preset-filled-surface-500"
                                        >Load</button
                                    >
                                    {#if session.hasRequiredConfig() && isFileLoaded}
                                        <button
                                            onclick={async () =>
                                                await saveFileContents()}
                                            type="button"
                                            class="btn preset-filled-surface-500"
                                            >Save</button
                                        >
                                    {/if}
                                {:else}
                                    <div>
                                        <LoadingIndicator size={30}
                                        ></LoadingIndicator>
                                    </div>
                                {/if}
                            </div>
                            {#if !hasRequiredConfig || gitErrorMessage}
                                <div
                                    class="items-center gap-3 flex justify-center items-center text-warning-500"
                                >
                                    <TriangleAlert class="w-7 h-7" />
                                    <div>
                                        {#if !hasRequiredConfig}
                                            <p>
                                                Missing required configuration.
                                            </p>
                                        {:else}
                                            <p>{gitErrorMessage}</p>
                                        {/if}
                                    </div>
                                    {#if !hasRequiredConfig}
                                        <button
                                            onclick={() => (tab = "workspace")}
                                            type="button"
                                            class="btn preset-tonal-surface"
                                            >Config</button
                                        >
                                    {/if}
                                </div>
                            {/if}

                            <markdoc-editor
                                name="mydoc.mdoc"
                                text={markdoc}
                                {theme}
                                bind:this={markdocEditorElement}
                            ></markdoc-editor>
                        </div>
                    </Tabs.Panel>
                    <Tabs.Panel value="viewer" base="my-4 h-full">
                        <div class="w-full h-full">
                            {#if markdocRendererController && markdoc}
                                <markdoc-renderer
                                    controller={markdocRendererController}
                                    {theme}
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
{:else}
    <div class="h-screen w-full flex flex-col justify-center items-center">
        <LoadingIndicator></LoadingIndicator>
    </div>
{/if}
