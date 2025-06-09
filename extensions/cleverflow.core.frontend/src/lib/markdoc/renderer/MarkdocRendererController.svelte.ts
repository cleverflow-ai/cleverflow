import BFlowController from "../../bflow/BFlowController.svelte.js";
import Markdoc from "@markdoc/markdoc";
import * as MarkdocNodeUtil from '../../common/utils/MarkdocNodeUtil.js';


export default class MarkdocRendererController {

    conductorServerUrl: string;

    markdoc: string | undefined = $state("");
    frontMatter: string = '';
    ast: any = $state(null);
    astContent: any = $state(null);
    bflowControllers: Map<string, BFlowController> = new Map();

    constructor(conductorServerUrl: string) {
        this.conductorServerUrl = conductorServerUrl;
    }

    setMarkdoc(markdoc: string) {
        this.markdoc = markdoc;
        this.frontMatter = this.extractFrontmatterText();
        this.ast = Markdoc.parse(this.convertToMarkdocStringForTransform(markdoc));
        this.astContent = Markdoc.transform(this.ast, {
            tags: this.getTransformConfigTags(),
        });
    }

    extractFrontmatterText() {
        const match = this.markdoc?.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
        if (match) {
            return `---\n${match[1].trim()}\n---`;
        }
        return `---\n \n---`;
    }

    getTransformConfigTags() {
        return {
            'b-flow': {
                render: 'BFlow',
                selfClosing: false
            },
        };
    }

    convertToMarkdocStringForTransform(markdoc: string) {
        return markdoc.split("\n").map(line => line.replace(/^\s+/, "")).join("\n");
    }

    getBFlowById(id: string) {
        const bflowText = MarkdocNodeUtil.getNodeById(this.markdoc ?? '', 'b-flow', id);
        return `${this.frontMatter}\n${bflowText}`;
    }

    getBFlowController(bflowId: string): BFlowController | undefined | null {
        if (!this.bflowControllers.has(bflowId)) {

            const bflowController = new BFlowController(
                this.conductorServerUrl,
            );
            this.bflowControllers.set(bflowId, bflowController);
        }

        return this.bflowControllers.get(bflowId);
    }
}