<svelte:options customElement="markdoc-renderer" />

<script lang="ts">
    import css from "../../../app.css?inline";
    // SMELL: This is a workaround to make TailwindCSS work in the web component.
    // IMPORTANT: this unuse import is required to make TailwindCSS work in the web component.
    import Tailwindcss from "../../common/components/Tailwindcss.svelte";
    import type MarkdocRendererController from "./MarkdocRendererController.svelte.js";
    import BFlow from "../../bflow/BFlow.svelte";
    import Self from "./Self.svelte";

    let { controller }: { controller: MarkdocRendererController } = $props();

    console.log("controller", controller);
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>

{#if controller && controller.astContent && controller.astContent.children}
    {#each controller.astContent.children as child}
        {#if child.name === "BFlow"}
            {@const id = child.attributes.id}
            {@const node = controller.findBFlowNode(id)}
            {@const text = controller.reconstructMarkdoc(node)}
            {@const bflowController = controller.getBFlowController(id)}
            <BFlow
                {...child.attributes}
                controller={bflowController}
                {node}
                {id}
                {text}
            ></BFlow>
        {:else}
            <svelte:element this={child.name} {...child.attributes}>
                {#if child.children}
                    <Self children={child.children} />
                {/if}
            </svelte:element>
        {/if}

        {#if typeof child === "string"}
            {child}
        {/if}
    {/each}
{/if}
