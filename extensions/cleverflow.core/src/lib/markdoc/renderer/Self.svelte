<script>
    import Self from "./Self.svelte";

    let { children, classes } = $props();
</script>

{#if children}
    {#each children as child}
        {#if child}
            {#if typeof child === "string"}{child}{/if}
            <svelte:element
                this={child.name}
                {...child.attributes}
                class={classes[child.name] || ""}
            >
                <Self children={child.children} {classes} />
            </svelte:element>
        {/if}
    {/each}
{/if}
