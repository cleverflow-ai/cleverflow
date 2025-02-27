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
    // import BFlow from "../bflow/BFlow.svelte";
    import BFlow from "./BFlowTest.svelte";

    let { markdoc, node }: any = $props();
    const ast = Markdoc.parse(markdoc);
    let transformedAST: any = $state();

    onMount(() => {
        transformedAST = Markdoc.transform(ast, {
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

    function findBFlowNode(node: any, bflowId: string): any {
        if (!node) return null;

        // If the node is an object with a tag name "b-flow", return it
        if (
            node.type === "tag" &&
            node.tag === "b-flow" &&
            node.attributes.id === bflowId
        ) {
            return node;
        }

        // If the node has children, search within them
        if (node.children) {
            for (const child of node.children) {
                const found = findBFlowNode(child, bflowId);
                if (found) return found;
            }
        }

        return null;
    }

    function reconstructMarkdoc(node: any, indentLevel = 1): string {
        if (!node) return "";

        if (["softbreak"].includes(node.type)) {
            return "\n";
        }

        const indent = "\t".repeat(indentLevel);

        if (node.type === "text") {
            return indent + node.attributes.content + "\n";
        }
        if (["paragraph", "inline"].includes(node.type)) {
            return node.children
                .map((child: any) => reconstructMarkdoc(child, indentLevel + 1))
                .join("\n");
        }

        if ("b-flow" === node.tag && !node.attributes.id) {
            return ``;
        }

        if ("sequence" === node.tag && node.children.length === 0) {
            return "";
        }

        // Convert attributes to Markdoc syntax
        let attributes = Object.entries(node.attributes || {})
            .map(([key, value]) => `${key}="${value}"`)
            .join(" ");

        let openingTag = `${indent}{% ${node.tag} ${attributes} %}`;
        let childrenContent =
            node.children
                ?.map((child: any) =>
                    reconstructMarkdoc(child, indentLevel + 1),
                )
                .join("\n") || "";
        let closingTag = `${indent}{% /${node.tag} %}`;

        return `${openingTag}\n${childrenContent}\n${closingTag}`;
    }
</script>

<svelte:element this={"style"}>{@html css}</svelte:element>

{#if transformedAST && transformedAST.children}
    {#each transformedAST.children as child}
        {#if child.name === "BFlow"}
            {@const node = findBFlowNode(ast, child.attributes.id)}
            {@const bflow = reconstructMarkdoc(node)}
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
