<script lang="ts">
    import type { Component } from "svelte";
    // import BFlow from "../bflow/BFlow.svelte";
    import BFlow from "./BFlowTest.svelte";

    let { markdoc, children }: any = $props();

    const components: Record<string, Component> = {
        BFlow,
    };
</script>

{#each children as child}
    {#if components[child.name]}
        <svelte:component
            this={components[child.name]}
            {...child.attributes}
            {markdoc}
        >
            <svelte:self children={child.children} />
        </svelte:component>
    {:else}
        <svelte:element this={child.name} {...child.attributes} {markdoc}>
            <svelte:self children={child.children} />
        </svelte:element>
    {/if}

    {#if typeof child === "string"}
        {child}
    {/if}
{/each}
