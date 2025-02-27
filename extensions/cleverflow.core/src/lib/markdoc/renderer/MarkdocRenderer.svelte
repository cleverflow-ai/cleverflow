<svelte:options customElement="markdoc-renderer" />

<script lang="ts">
    import css from "../../../app.css?inline";
    import Markdoc from "@markdoc/markdoc";
    import yaml from "js-yaml";
    import { onMount } from "svelte";
    // SMELL: This is a workaround to make TailwindCSS work in the web component.
    // IMPORTANT: this unuse import is required to make TailwindCSS work in the web component.
    import Tailwindcss from "../../common/components/Tailwindcss.svelte";
    import LoadingIndicator from "../../common/components/LoadingIndicator.svelte";
    import type MarkdocRendererController from "./MarkdocRendererController.js";
    // import BFlow from "../bflow/BFlow.svelte";

    import BFlow from "./BFlowTest.svelte";

    let { controller }: { controller: MarkdocRendererController } = $props();
    
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>

{#if controller.astContent && controller.astContent.children}
    {#each controller.astContent.children as child}
        {#if child.name === "BFlow"}
            {@const node = controller.findBFlowNode(child.attributes.id)}
            {@const bflow = controller.reconstructMarkdoc(node)}
            <BFlow {...child.attributes} {bflow}></BFlow>
        {:else}
            <svelte:element
                this={child.name}
                {...child.attributes}
                node={child}
            >
                <svelte:self children={child.children} />
            </svelte:element>
        {/if}

        {#if typeof child === "string"}
            {child}
        {/if}
    {/each}
{:else}
    <div class="h-full w-full flex flex-col items-center justify-center gap-2">
        <LoadingIndicator />
    </div>
{/if}
