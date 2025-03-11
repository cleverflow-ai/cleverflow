<svelte:options customElement="markdoc-editor" />

<script lang="ts">
    import css from "../../../app.css?inline";
    import cartaCss from "carta-md/default.css?inline"; /* Default theme */
    import { Carta, MarkdownEditor } from "carta-md";
    import DOMPurify from "isomorphic-dompurify";
    import { onMount } from "svelte";

    // SMELL: This is a workaround to make TailwindCSS work in the web component.
    // IMPORTANT: this unuse import is required to make TailwindCSS work in the web component.

    let { name = "dummy.mdoc", text = "", theme = "crimson" } = $props();

    let mainElement: any;
    let markdownValue = $state(text);

    const carta = new Carta({
        // Remember to use a sanitizer to prevent XSS attacks!
        // More on that below
        sanitizer: DOMPurify.sanitize,
    });

    onMount(() => {
        const child = mainElement.querySelector(
            ".carta-editor .carta-toolbar .button",
        );
        if (child) {
            console.log(`>>> found`);
            child.style.display = "none"; // Hide the element
        } else {
            console.log(" >>> not found");
        }
    });

    export const getMarkdown = () => {
        return markdownValue;
    };
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>
<svelte:element this={"style"}>{@html cartaCss}</svelte:element>
<main data-theme={theme} bind:this={mainElement}>
    <MarkdownEditor {carta} mode={"tabs"} bind:value={markdownValue} />
</main>
