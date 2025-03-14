<svelte:options customElement="markdoc-reader" />

<script lang="ts">
    import { onMount } from "svelte";
    import Markdoc from "@markdoc/markdoc";
    import * as MarkdocNodeUtil from "../../common/utils/MarkdocNodeUtil.js";
    import css from "../../../app.css?inline";
    import Self from "./Self.svelte";
    import classes from "../../common/utils/StylesUtil.js";

    let { markdoc, theme = "crimson" } = $props();
    let astContent: any = $state(null);

    onMount(() => {
        const ast = Markdoc.parse(
            markdoc
                .split("\n")
                .map((line: any) => line.replace(/^\s+/, ""))
                .join("\n"),
        );
        astContent = Markdoc.transform(ast, {
            tags: {
                agents: {
                    render: "Agents",
                    selfClosing: false,
                },
            },
        });
    });
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>
<main data-theme={theme}>
    {#if astContent && astContent.children}
        {#each astContent.children as child}
            {#if child.name === "Agents"}
                {@const text = MarkdocNodeUtil.extractNodeContent(
                    markdoc,
                    "agents",
                )}
                <div {...child.attributes} {theme} {text}></div>
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
