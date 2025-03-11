import BFlowController from "../../bflow/BFlowController.svelte.js";
import Markdoc from "@markdoc/markdoc";

export default class MarkdocRendererController {

    servers: string | string[] = "";
    token: string = "";

    markdoc: string | undefined = $state("");
    ast: any = $state(null);
    astContent: any = $state(null);
    bflowControllers: Map<string, BFlowController> = new Map();

    constructor(servers: string | string[], token: string) {
        this.servers = servers;
        this.token = token;
    }

    setMarkdoc(markdoc: string) {
        this.markdoc = markdoc;
        this.ast = Markdoc.parse(this.convertToMarkdocStringForTransform(markdoc));
        this.astContent = Markdoc.transform(this.ast, {
            tags: this.getTransformConfigTags(),
        });
    }

    getTransformConfigTags() {
        return {
            'b-flow': {
                render: 'BFlow',
                selfClosing: false
            },
            // 'sequence': {
            //     render: 'Sequence',
            //     selfClosing: false
            // },
            // 'get-text': {
            //     render: 'GetText',
            //     selfClosing: false
            // },
            // 'filter-data': {
            //     render: 'FilterData',
            //     selfClosing: false
            // },
            // 'select-machine': {
            //     render: 'SelectMachine',
            //     selfClosing: false
            // }
        };
    }


    convertToMarkdocStringForTransform(markdoc: string) {
        return markdoc.split("\n").map(line => line.replace(/^\s+/, "")).join("\n");
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
        if (["paragraph", "inline", "list", "item"].includes(node.type)) {
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

    getBFlowController(bflowId: string): BFlowController | undefined | null {
        if (!this.bflowControllers.has(bflowId)) {

            const bflowController = new BFlowController(
                this.servers,
                this.token,
            );
            this.bflowControllers.set(bflowId, bflowController);
        }

        return this.bflowControllers.get(bflowId);
    }
}