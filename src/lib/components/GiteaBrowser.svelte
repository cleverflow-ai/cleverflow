<script lang="ts">
    import { onMount } from "svelte";
    import FileController from "@cleverflow-ai/cleverflow.core.frontend/webcomponents/file-controller.js";
    import { createMcpClient } from "@cleverflow-ai/cleverflow.mcp/dist/McpClient.js";
    import { z } from "zod";

    let client: any;
    const baseUrl = "https://gitea-atlascopco-integration.clevernow.com/api/v1";
    const apiKey = "04f4b0dada8fa8632dc7541f2f2131c703693e7e";
    const repoOwner = "clevernow";
    const repo = "atlascopco-dasm";
    const root = {
        id: "__root__",
        name: "root",
        path: "",
        type: "folder",
    };
    let fileController: FileController | null = $state(null);
    let selectedFileNode: any = $state(null);
    let selectedFileContent: string | null = $state(null);

    const breadcrumb = $derived.by(() => {
        const result = selectedFileNode?.path?.split("/") ?? [];
        if (result.length > 0) {
            result.unshift(root.name);
        }
        return result;
    });

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

        const callToolResult = await client?.callTool(
            {
                name: "fetch-gitea",
                arguments: {
                    baseUrl,
                    apiKey,
                    repoOwner,
                    repo,
                    filePath: node?.path ?? "",
                },
            },
            z.any(),
            {
                timeout: 3600 * 1000,
            },
        );
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
        return null;
    };

    const fetchFileContent = async (node: any) => {
        selectedFileNode = node;
        selectedFileContent = null;

        const callToolResult = await client?.callTool(
            {
                name: "fetch-gitea",
                arguments: {
                    baseUrl,
                    apiKey,
                    repoOwner,
                    repo,
                    filePath: node?.path ?? "",
                },
            },
            z.any(),
            {
                timeout: 3600 * 1000,
            },
        );
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
    };

    function goToBreadcrumb(index: number) {
        const pathUpTo = breadcrumb.slice(0, index + 1).join("/");
        // Ví dụ gọi hàm controller để load folder tại path đó
        // fileController?.loadFolderFromPath(pathUpTo);
    }
</script>

<div class="flex h-screen">
    <!-- Sidebar trái -->
    <div class="w-1/3 border-r border-gray-200 p-2 overflow-auto">
        {#if fileController}
            <file-tree controller={fileController}></file-tree>
        {/if}
    </div>

    <!-- Nội dung bên phải -->
    <div class="w-2/3 p-4 overflow-auto flex flex-col">
        {#if breadcrumb.length > 0}
            <ol
                class="flex items-center gap-2 text-sm text-gray-600 mb-4 overflow-x-auto whitespace-nowrap scrollbar-thin"
            >
                {#if breadcrumb.length > 4}
                    <li><span class="opacity-50">…</span></li>
                    {#each breadcrumb.slice(-3) as segment, i}
                        <!-- render 3 phần cuối cùng -->
                        <span class="font-medium">{segment}</span>
                        {#if i < breadcrumb.length - 1}
                            <li class="opacity-50" aria-hidden>&rsaquo;</li>
                        {/if}
                    {/each}
                {:else}
                    {#each breadcrumb as segment, i}
                        <!-- render đầy đủ -->
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
                class="whitespace-pre-wrap font-mono text-sm bg-gray-100 p-4
            rounded"
            >
                {selectedFileContent}
            </div>
        {/if}
    </div>
</div>
