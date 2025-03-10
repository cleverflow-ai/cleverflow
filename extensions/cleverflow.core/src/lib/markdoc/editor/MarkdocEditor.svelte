<svelte:options customElement="markdoc-editor" />

<script>
    import css from "../../../app.css?inline";
    import cartaCss from "carta-md/default.css?inline"; /* Default theme */
    import { Carta, MarkdownEditor } from "carta-md";
    import DOMPurify from "isomorphic-dompurify";
    import { onMount } from "svelte";

    // SMELL: This is a workaround to make TailwindCSS work in the web component.
    // IMPORTANT: this unuse import is required to make TailwindCSS work in the web component.

    let { name = "dummy.mdoc", text = "" } = $props();

    let markdownValue = $state(text);

    const carta = new Carta({
        // Remember to use a sanitizer to prevent XSS attacks!
        // More on that below
        sanitizer: DOMPurify.sanitize,
    });

    export const getMarkdown = () => {
        return markdownValue;
    };
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>
<svelte:element this={"style"}>{@html cartaCss}</svelte:element>

<MarkdownEditor {carta} mode={"tabs"} bind:value={markdownValue} />

<style>
    :global(#preview-tab) {
        display: none !important;
    }

    :global(
            .carta-editor
                .carta-toolbar
                .carta-toolbar-left
                .button[tabindex="1"]
        ) {
        display: none !important;
    }
</style>
