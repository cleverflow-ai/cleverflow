import Markdoc from "@markdoc/markdoc";
import yaml from "js-yaml";

export default class MarkdocRendererController {

    markdoc: string;
    ast: any;
    astContent: any;

    constructor(markdoc: string) {
        this.markdoc = markdoc;
        this.ast = Markdoc.parse(markdoc);
        this.astContent = Markdoc.transform(this.ast, {
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
                frontmatter: this.getFrontmatter(this.ast.attributes.frontmatter),
            },
        });
    }

    getFrontmatter(frontmatter: string) {
        return yaml.load(frontmatter);
    }

    findBFlowNode(bflowId: string): any {
        return this.findBFlowNodeFromGivenNode(this.ast, bflowId);
    }

    findBFlowNodeFromGivenNode(node: any, bflowId: string): any {
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
                const found = this.findBFlowNodeFromGivenNode(child, bflowId);
                if (found) return found;
            }
        }

        return null;
    }

    reconstructMarkdoc(node: any, indentLevel = 1): string {
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
                .map((child: any) => this.reconstructMarkdoc(child, indentLevel + 1))
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
                    this.reconstructMarkdoc(child, indentLevel + 1),
                )
                .join("\n") || "";
        let closingTag = `${indent}{% /${node.tag} %}`;

        return `${openingTag}\n${childrenContent}\n${closingTag}`;
    }
}