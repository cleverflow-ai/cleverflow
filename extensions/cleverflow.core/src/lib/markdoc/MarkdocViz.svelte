<svelte:options customElement="markdoc-viz" />

<script lang="ts">
    import Markdoc from "@markdoc/markdoc";
    import yaml from "js-yaml";
    import { onMount } from "svelte";
    // SMELL: This is a workaround to make TailwindCSS work in the web component.
    // IMPORTANT: this unuse import is required to make TailwindCSS work in the web component.
    import Tailwindcss from "../common/components/Tailwindcss.svelte";
    import LoadingIndicator from "../common/components/LoadingIndicator.svelte";
    import MarkdocRenderer from "./MarkdocRenderer.svelte";

    let { markdoc }: any = $props();
    let docTree: any = $state();

    onMount(() => {
        const ast = Markdoc.parse(markdoc);
        docTree = Markdoc.transform(ast, {
            tags: {
                "b-flow": {
                    render: "BFlow",
                    attributes: {
                        id: {
                            type: String,
                            default: "",
                        },
                    },
                },
            },
            variables: {
                frontmatter: getFrontmatter(ast.attributes.frontmatter),
            },
        });
    });

    function getFrontmatter(frontmatter: string) {
        return yaml.load(frontmatter);
    }
</script>

{#if docTree && docTree.children}
    <MarkdocRenderer children={docTree.children} {markdoc} />
{:else}
    <div class="h-full w-full flex flex-col items-center justify-center gap-2">
        <LoadingIndicator />
    </div>
{/if}
