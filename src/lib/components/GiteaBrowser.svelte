<script lang="ts">
    import { onMount } from "svelte";
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import FileController from "@cleverflow-ai/cleverflow.core.frontend/webcomponents/file-controller.js";
    import { createMcpClient } from "@cleverflow-ai/cleverflow.mcp/dist/McpClient.js";
    import { z } from "zod";
    import { Settings, TriangleAlert } from "lucide-svelte";

    let client: any;

    let url = "";
    let token = "";
    let branch = "";
    let owner = "";
    let repo = "";
    const root = {
        id: "__root__",
        name: "root",
        path: "",
        type: "folder",
    };
    let fileController: FileController | null = $state(null);
    let selectedFileNode: any = $state(null);
    let selectedFileContent: string | null = $state(null);
    let errorMessage: string | null = $state(null);

    const breadcrumb = $derived.by(() => {
        const result = selectedFileNode?.path?.split("/") ?? [];
        if (result.length > 0) {
            result.unshift(root.name);
        }
        return result;
    });

    let settingModalState = $state(false);

    onMount(async () => {
        client = await createMcpClient(
            "http://localhost:3000/mcp",
            "@cleverflow-ao/cleverflow.mcp.io",
            "1.0.0",
        );
        await import(
            "@cleverflow-ai/cleverflow.core.frontend/webcomponents/file-tree.js"
        );

        fileController = new FileController(
            fetchFolderChildren,
            fetchFileContent,
        );
        fileController.tree = root;
    });

    const fetchFolderChildren = async (node: any) => {
        selectedFileNode = node;
        selectedFileContent = null;
        errorMessage = null;

        try {
            const callToolResult = await client?.callTool(
                {
                    name: "get_file_contents",
                    arguments: {
                        url,
                        token,
                        branch,
                        owner,
                        repo,
                        path: node?.path ?? "",
                    },
                },
                z.any(),
                {
                    timeout: 3600 * 1000,
                },
            );

            if (callToolResult.error) {
                errorMessage = callToolResult.error.message ?? "Unknown error";
                return;
            }
            const content =
                callToolResult.content &&
                Array.isArray(callToolResult.content) &&
                callToolResult.content.length > 0
                    ? callToolResult.content[0]
                    : null;
            if (content) {
                if (content.type === "data" && Array.isArray(content.data)) {
                    return content.data.map((item: any) => ({
                        id: item.sha,
                        name: item.name,
                        type: item.type === "dir" ? "folder" : "file",
                        path: item.path,
                    }));
                } else if (content.type === "text" && content.text) {
                    return content.text;
                }
            }
        } catch (exception: any) {
            errorMessage = exception.message ?? "Unknown client error";
        }
        return null;
    };

    const fetchFileContent = async (node: any) => {
        selectedFileNode = node;
        selectedFileContent = null;
        errorMessage = null;

        try {
            const callToolResult = await client?.callTool(
                {
                    name: "get_file_contents",
                    arguments: {
                        url,
                        token,
                        branch,
                        owner,
                        repo,
                        path: node?.path ?? "",
                    },
                },
                z.any(),
                {
                    timeout: 3600 * 1000,
                },
            );

            if (callToolResult.error) {
                errorMessage = callToolResult.error.message ?? "Unknown error";
                return;
            }

            const content =
                callToolResult.content &&
                Array.isArray(callToolResult.content) &&
                callToolResult.content.length > 0
                    ? callToolResult.content[0]
                    : null;
            if (content) {
                if (content.type === "text" && content.text) {
                    selectedFileContent = content.text;
                }
            }
        } catch (exception: any) {
            errorMessage = exception.message ?? "Unknown client error";
        }
    };

    function goToBreadcrumb(index: number) {
        const pathUpTo = breadcrumb.slice(0, index + 1).join("/");
        // fileController?.loadFolderFromPath(pathUpTo);
    }
</script>

<div class="flex h-screen">
    <div
        class="w-1/3 border-r border-gray-200 p-2 overflow-auto flex flex-col gap-2"
    >
        <button
            class="ml-2 text-surface-500"
            onclick={() => (settingModalState = true)}
        >
            <div class="flex items-center gap-2">
                <Settings class="w-5 h-5" /> Settings
            </div>
        </button>
        {#if fileController}
            <file-tree controller={fileController}></file-tree>
        {/if}
    </div>

    <div class="w-2/3 p-4 overflow-auto flex flex-col">
        {#if errorMessage}
            <div
                class="card preset-outlined-error-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto]"
            >
                <TriangleAlert />
                <div>
                    <p class="font-bold">Error</p>
                    <p class="text-xs opacity-60">{errorMessage}</p>
                </div>
            </div>
        {:else}
            {#if breadcrumb.length > 0}
                <ol
                    class="flex items-center gap-2 text-sm text-gray-600 mb-4 overflow-x-auto whitespace-nowrap scrollbar-thin"
                >
                    {#if breadcrumb.length > 4}
                        <li><span class="opacity-50">…</span></li>
                        {#each breadcrumb.slice(-3) as segment, i}
                            <span class="font-medium">{segment}</span>
                            {#if i < breadcrumb.length - 1}
                                <li class="opacity-50" aria-hidden>&rsaquo;</li>
                            {/if}
                        {/each}
                    {:else}
                        {#each breadcrumb as segment, i}
                            <span class="font-medium">{segment}</span>
                            {#if i < breadcrumb.length - 1}
                                <li class="opacity-50" aria-hidden>&rsaquo;</li>
                            {/if}
                        {/each}
                    {/if}
                </ol>
            {/if}
            {#if selectedFileContent}
                <div
                    class="whitespace-pre-wrap font-mono text-sm bg-gray-100 p-4 rounded"
                >
                    {selectedFileContent}
                </div>
            {/if}
        {/if}
    </div>
</div>

<Modal
    open={settingModalState}
    onOpenChange={(e) => (settingModalState = e.open)}
    triggerBase="btn preset-tonal"
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
    backdropClasses="backdrop-blur-sm"
    backdropBase="opacity-50"
>
    {#snippet content()}
        <div
            class="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
        >
            <div
                class="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md space-y-4"
            >
                <h2 class="text-lg font-semibold mb-2">Gitea Settings</h2>

                <div class="space-y-2">
                    <div>
                        <!-- svelte-ignore a11y_label_has_associated_control -->
                        <label class="block text-sm font-medium mb-1">URL</label
                        >
                        <input
                            type="text"
                            bind:value={url}
                            class="w-full border px-2 py-1 rounded"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1"
                            >Token</label
                        >
                        <input
                            type="text"
                            bind:value={token}
                            class="w-full border px-2 py-1 rounded"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1"
                            >Branch</label
                        >
                        <input
                            type="text"
                            bind:value={branch}
                            class="w-full border px-2 py-1 rounded"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1"
                            >Owner</label
                        >
                        <input
                            type="text"
                            bind:value={owner}
                            class="w-full border px-2 py-1 rounded"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1"
                            >Repo</label
                        >
                        <input
                            type="text"
                            bind:value={repo}
                            class="w-full border px-2 py-1 rounded"
                        />
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-4">
                    <button
                        type="button"
                        class="btn preset-filled-primary-500"
                        onclick={() => (settingModalState = false)}>Done</button
                    >
                </div>
            </div>
        </div>
    {/snippet}
</Modal>
