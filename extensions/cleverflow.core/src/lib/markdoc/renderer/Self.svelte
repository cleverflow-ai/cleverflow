<script>
    import Self from "./Self.svelte";

    let { children } = $props();
</script>

{#if children}
    {#each children as child}
        {#if child}
            {#if typeof child === "string"}{child}{/if}
            <svelte:element this={child.name} {...child.attributes}>
                <Self children={child.children} />
            </svelte:element>
        {/if}
    {/each}
{/if}
