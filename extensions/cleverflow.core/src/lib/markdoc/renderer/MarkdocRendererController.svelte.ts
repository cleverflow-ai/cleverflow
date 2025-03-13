import BFlowController from "../../bflow/BFlowController.svelte.js";
import Markdoc from "@markdoc/markdoc";
import * as MarkdocNodeUtil from '../../common/utils/MarkdocNodeUtil.js';

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
        };
    }

    convertToMarkdocStringForTransform(markdoc: string) {
        return markdoc.split("\n").map(line => line.replace(/^\s+/, "")).join("\n");
    }

    getBFlowById(id: string) {
        return MarkdocNodeUtil.getNodeById(this.markdoc ?? '', 'b-flow', id);
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