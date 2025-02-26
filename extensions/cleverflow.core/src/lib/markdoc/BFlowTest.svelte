<script lang="ts">
    import Markdoc from "@markdoc/markdoc";
    import { onMount } from "svelte";

    let { markdoc, id }: any = $props();
    let bflowContent = $state();

    onMount(() => {
        const ast = Markdoc.parse(markdoc);

        const bFlowNode = findBFlowNode(ast);

        bflowContent = bFlowNode ? reconstructMarkdoc(bFlowNode) : null;

        // console.log(bFlowContent);
    });

    function findBFlowNode(node: any): any {
        if (!node) return null;

        // If the node is an object with a tag name "b-flow", return it
        if (
            node.type === "tag" &&
            node.tag === "b-flow" &&
            node.attributes.id === id
        ) {
            return node;
        }

        // If the node has children, search within them
        if (node.children) {
            for (const child of node.children) {
                const found = findBFlowNode(child);
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

{#if bflowContent}
    <pre class="bg-gray-100 p-4 rounded-lg">
        <code>{bflowContent}</code>
    </pre>
{:else}
    <div class="text-red-500">BFlow with ID "{id}" not found.</div>
{/if}
