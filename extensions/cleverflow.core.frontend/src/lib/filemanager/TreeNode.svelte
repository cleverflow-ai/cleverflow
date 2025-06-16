<script lang="ts">
    import { ChevronRight, ChevronDown, File, Folder } from "lucide-svelte";
    import TreeNodeSelf from "./TreeNode.svelte";
    import { onMount } from "svelte";
    import type { FileNode } from "./FileNode.js";
    import LoadingIndicator from "../common/components/LoadingIndicator.svelte";

    const { node, controller } = $props();

    let expanded: Record<string, boolean> = $state({});
    let isLoading = $state(false);

    onMount(() => {});

    const onSelect = async (node: FileNode) => {
        isLoading = true;
        if (node.type === "file") {
            controller.open(node);
        } else {
            if (!node.children) {
                expanded[node.id] = true;
                await controller.open(node);
            } else {
                expanded[node.id] = !expanded[node.id];
            }
        }
        isLoading = false;
    };
</script>

<li class="ml-1">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="flex items-center gap-1 cursor-pointer px-1 py-0.5 rounded tree-node"
        onclick={async () => await onSelect(node)}
    >
        {#if node.type === "folder"}
            {#if expanded[node.id]}
                <ChevronDown class="w-4 h-4 text-gray-500" />
            {:else}
                <ChevronRight class="w-4 h-4 text-gray-500" />
            {/if}
            <Folder class="w-4 h-4 text-yellow-500" />
            <span>{node.name}</span>
        {:else}
            <File class="w-4 h-4 text-blue-500" />
            <span>{node.name}</span>
        {/if}
        {#if isLoading}
            <div class="ml-1">
                <LoadingIndicator size={20}></LoadingIndicator>
            </div>
        {/if}
    </div>

    {#if node.type === "folder" && expanded[node.id]}
        <ul class="ml-1 border-l border-gray-300 dark:border-gray-700 pl-2">
            {#each node.children || [] as child}
                <TreeNodeSelf node={child} {controller} />
            {/each}
        </ul>
    {/if}
</li>
