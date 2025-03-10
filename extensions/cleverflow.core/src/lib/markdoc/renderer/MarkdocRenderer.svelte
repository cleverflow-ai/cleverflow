<svelte:options customElement="markdoc-renderer" />

<script lang="ts">
    import { onMount } from "svelte";
    import css from "../../../app.css?inline";
    import BFlow from "../../bflow/BFlow.svelte";
    import type MarkdocRendererController from "./MarkdocRendererController.svelte.js";
    import Self from "./Self.svelte";
    import md5 from "md5";

    // let { controller }: { controller: MarkdocRendererController } = $props();
    let { controller, theme = "crimson" } = $props();

    const classes = {
        // Headings
        h1: "text-4xl font-bold leading-tight",
        h2: "text-3xl font-semibold leading-snug",
        h3: "text-2xl font-medium leading-normal",
        h4: "text-xl font-medium leading-relaxed",
        h5: "text-lg font-medium leading-loose",
        h6: "text-base font-medium",

        // Lists
        li: "ml-4",
        ol: "ml-6 list-decimal",
        ul: "ml-6 list-disc",

        // Inline Text Formatting
        strong: "font-bold",
        b: "font-bold",
        i: "italic",
        u: "underline",
        em: "italic",
        mark: "bg-yellow-200 px-1", // Highlighted text
        del: "line-through",
        ins: "underline text-green-600", // Inserted text
        sub: "text-sm align-sub",
        sup: "text-sm align-super",

        // Block Elements
        p: "text-base leading-relaxed",
        blockquote: "border-l-4 border-gray-400 pl-4 italic text-gray-600",
        pre: "bg-gray-900 text-white p-4 rounded-md overflow-x-auto",
        code: "font-mono text-sm bg-gray-200 px-1 rounded",

        // Tables
        table: "w-full border-collapse",
        thead: "bg-gray-200",
        tbody: "bg-white",
        tr: "border-b border-gray-300",
        th: "px-4 py-2 font-semibold text-left border border-gray-300",
        td: "px-4 py-2 border border-gray-300",

        // Links
        a: "text-blue-600 hover:text-blue-800 underline",

        // Horizontal Rule
        hr: "border-t-2 border-gray-300 my-4",
    };
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>
{#key md5(controller.markdoc)}
    <main data-theme={theme}>
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
                        {theme}
                        {id}
                        {text}
                    ></BFlow>
                {:else}
                    <svelte:element
                        this={child.name}
                        {...child.attributes}
                        class={classes[child.name] || ""}
                    >
                        {#if child.children}
                            <Self children={child.children} {classes} />
                        {/if}
                    </svelte:element>
                {/if}

                {#if typeof child === "string"}
                    {child}
                {/if}
            {/each}
        {/if}
    </main>
{/key}
