import _ from "lodash";
import { BFLowState } from "./BFlowState.js";
import Styles from './Styles.js';
import { addToast, ToastType } from '../common/components/toast/ToastStore.js';
import * as MarkocNodeUtil from '../common/utils/MarkdocNodeUtil.js';
import * as JsonUtil from '../common/utils/JsonUtil.js';
import { BFlowNodeState } from "./BFlowNodeState.js";

export default class BFlowController {

    public state: BFLowState = $state(BFLowState.NONE);

    public bflow: any;
    public rawBFlow: any;
    public bflowviz: any = $state(null);
    public bflowRunResult: any = $state(null);

    private text: string | undefined;

    // private instanceId: string;
    // private sessionId: string;
    private generateBFlow: (
        text: string,
        onProgress: (state: string) => void,
        onCompleted: (result: any) => void,
        onFailed: (error: Error) => void,
    ) => Promise<void>;

    private runBFlow: (
        bflow: any,
        onProgress: (data: any) => void,
        onCompleted: (data: any) => void,
        onFailed: (error: Error) => void,
    ) => Promise<void>;

    public refresh: (() => void) | null = null;

    constructor(
        generateBFlow: (
            text: string,
            onProgress: (state: string) => void,
            onCompleted: (result: any) => void,
            onFailed: (error: Error) => void,
        ) => Promise<void>,
        runBFlow: (
            bflow: any,
            onProgress: (data: any) => void,
            onCompleted: (data: any) => void,
            onFailed: (error: Error) => void,
        ) => Promise<void>
    ) {
        this.generateBFlow = generateBFlow;
        this.runBFlow = runBFlow;
    }

    async connect() {
        this.setState(BFLowState.CONNECTING);
        try {

            this.setState(BFLowState.CONNECT_SUCCESS);
            return true;
        } catch (exception) {
            console.error("Failed to connect to the server:", exception);
            this.setState(BFLowState.CONNECT_FAILED);
            return false;
        }
    }

    async disconnect() {
        // try {
        //     this.conductorClient = undefined;
        // } catch { }

        this.setState(BFLowState.NONE);
    }

    setState(state: BFLowState) {
        this.state = state;
        if (this.refresh) {
            this.refresh();
        }
    }

    isDocumentChanged(text: string) {
        if (this.text === undefined) {
            return false;
        }
        return this.text !== text;
    }

    async ensureBFlow(text: string) {
        this.text = text;
        this.bflowviz = null;

        const result = this.extractGeneratedData(text);

        if (result.bflow && result.bflowviz) {
            this.bflow = result.bflow;
            this.setState(BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_SUCCESS);

            this.addDataPropertyToNodes(result.bflowviz.nodes);
            const tree = this.buildTree(result.bflowviz.nodes);
            this.calculatePositions(tree);
            this.bflowviz = result.bflowviz;
            this.setState(BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_SUCCESS);
        } else {
            try {
                this.setState(BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW);

                await this.generateBFlow(
                    this.text,
                    (state: string) => {
                        if (state in BFLowState) {
                            const bflowState = BFLowState[state as keyof typeof BFLowState];
                            this.setState(bflowState);
                        }
                    },
                    (data: any) => {
                        this.bflow = data?.bflow;
                        this.setState(BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_SUCCESS);

                        this.bflowviz = data?.bflowviz;

                        if (this.bflowviz) {
                            this.addDataPropertyToNodes(this.bflowviz.nodes);
                            const tree = this.buildTree(this.bflowviz.nodes);
                            this.calculatePositions(tree);
                            this.setState(BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_SUCCESS);
                        }
                    },
                    (error: Error) => {
                        console.log('>>>>> on Failed');
                        console.error("Failed to convert text to BFlow:", error);
                        this.setState(BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_FAILED);
                        addToast("Failed to convert text to BFlow", ToastType.ERROR);
                    }
                );
            } catch (exception) {
                console.error("Failed to convert text to BFlow:", exception);
                this.setState(BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_FAILED);
                addToast("Failed to convert text to BFlow", ToastType.ERROR);
                return;
            }
        }

        if (this.bflow) {
            this.rawBFlow = JSON.parse(JSON.stringify(this.bflow));
        }

        if (this.bflowviz && result.outs) {
            this.bflowRunResult = result.outs;
            this.updateBFlowRunResult();
            this.setState(BFLowState.RUN_BFLOW_SUCCESS);
        }
    };

    private extractGeneratedData(content: string): any {
        const result = {
            bflow: null,
            bflowviz: null,
            outs: null,
        };
        try {
            const generatedData = MarkocNodeUtil.getNodeByName(content, 'generated-data');
            if (!generatedData) {
                return result;
            }

            const bflowContent = JsonUtil.fixJsonString(MarkocNodeUtil.extractNodeContent(generatedData, 'bflow') ?? '');
            if (bflowContent) {
                result.bflow = JSON.parse(bflowContent);
            }

            const bflowvizContent = JsonUtil.fixJsonString(MarkocNodeUtil.extractNodeContent(generatedData, 'bflowviz') ?? '');
            if (bflowvizContent) {
                result.bflowviz = JSON.parse(bflowvizContent);
            }

            let outsContent = JsonUtil.fixJsonString(MarkocNodeUtil.extractNodeContent(generatedData, 'outs') ?? '');
            if (outsContent) {
                result.outs = JSON.parse(outsContent);
            }
        } catch (exception) {
            console.log(exception);
        }
        return result;
    }

    async executeBFlow() {
        if (this.state === BFLowState.RUN_BFLOW) {
            return;
        }

        this.setState(BFLowState.RUN_BFLOW);

        try {
            await this.runBFlow(this.rawBFlow,
                (data: any) => {
                    const bflow = data?.bflow;
                    const bflowRunResult = data?.outs;

                    if (bflow && bflowRunResult) {
                        this.bflow = bflow;
                        this.bflowRunResult = bflowRunResult;
                        this.updateBFlowRunResult();
                    }
                    this.setState(BFLowState.RUN_BFLOW_IN_PROGRESS);
                },
                (data: any) => {
                    const bflow = data?.bflow;
                    const bflowRunResult = data?.outs;

                    if (bflow && bflowRunResult) {
                        this.bflow = bflow;
                        this.bflowRunResult = bflowRunResult;
                        this.updateBFlowRunResult();
                    }
                    this.setState(BFLowState.RUN_BFLOW_SUCCESS);
                    addToast("Successfully ran BFlow", ToastType.SUCCESS);
                },
                (error: Error) => {
                    console.error(">>> BFlow run failed");
                    this.setState(BFLowState.RUN_BFLOW_FAILED);
                    addToast("Failed to run BFlow", ToastType.ERROR);
                }
            );
        } catch (e: any) {
            console.error(e);
            this.setState(BFLowState.RUN_BFLOW_FAILED);
            addToast("Failed to run BFlow", ToastType.ERROR)
        }
    }

    updateBFlowRunResult() {
        if (!this.bflowRunResult) {
            return;
        }
        const root = this.bflow?.root;
        this.updateBFlowNodeResult(root);
    }

    updateBFlowNodeResult(node: any) {
        if (!node) {
            return;
        }
        const vizNode = _.find(this.bflowviz.nodes, (vizNode: any) => {
            return node.id === vizNode.id;
        });
        if (vizNode) {
            this.bflowviz.currentDate = new Date();
            vizNode.data.state = node.state;
        }
        if (node.goto && node.goto.length > 0) {
            _.forEach(node.goto, (childNode: any) => {
                this.updateBFlowNodeResult(childNode);
            });
        }
    }

    findClientActionRequiredNode(node: any): any {
        if (node.state === BFlowNodeState.WAITING_FOR_DATA) {
            return node;
        }
        if (node.goto && node.goto.length > 0) {
            for (let i = 0; i < node.goto.length; i++) {
                const foundNode = this.findClientActionRequiredNode(node.goto[i]);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
        return null;
    }

    isStateLoading() {
        return (
            this.state === BFLowState.CONNECTING ||
            this.state === BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW ||
            this.state === BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ ||
            this.state === BFLowState.RUN_BFLOW ||
            this.state === BFLowState.RUN_BFLOW_IN_PROGRESS
        );
    };

    isFailedState() {
        return (
            this.state === BFLowState.CONNECT_FAILED ||
            this.state === BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_FAILED ||
            this.state === BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_FAILED ||
            this.state === BFLowState.RUN_BFLOW_FAILED
        );
    };

    isFinishedState() {
        return (
            this.state === BFLowState.CONNECT_SUCCESS ||
            this.state === BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_SUCCESS ||
            this.state === BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_SUCCESS ||
            this.state === BFLowState.RUN_BFLOW_SUCCESS
        );
    };

    addDataPropertyToNodes(nodes: any) {
        if (nodes && nodes.length > 0) {
            _.forEach(nodes, (node: any) => {
                node.data = JSON.parse(JSON.stringify(node));
                node.position = {
                    x: 0,
                    y: 0,
                };
                if (node.type === "ENTRY" || node.type === "SEQUENCE") {
                    node.width = Styles.NODE.DEFAULT.WIDTH;
                    node.height = Styles.NODE.DEFAULT.HEIGHT;
                    node.dimension = {
                        width: node.width,
                        height: node.height,
                    };
                } else {
                    node.width = Styles.NODE.ACTION_NODE.WIDTH;
                    node.height = Styles.NODE.ACTION_NODE.HEIGHT;
                    node.dimension = {
                        width: node.width,
                        height: node.height,
                    };
                }
            });
        }
    };

    buildTree(nodes: any) {
        if (!nodes) {
            return null;
        }
        const nodeMap = new Map();
        const rootNodes: any = [];

        // Create a map for quick node lookup by ID
        nodes.forEach((node: any) =>
            nodeMap.set(node.id, { ...node, children: [] }),
        );

        // Assign children to their respective parents
        nodes.forEach((node: any) => {
            if (node.parentNodeId !== null) {
                nodeMap
                    .get(node.parentNodeId)
                    .children.push(nodeMap.get(node.id));
            } else {
                rootNodes.push(nodeMap.get(node.id));
            }
        });

        return rootNodes;
    }

    calculatePositions(
        nodes: any,
        startX = 0,
        startY = 0,
        xGap = 20,
        yGap = 40,
    ) {
        if (!nodes) {
            return;
        }
        let xOffset = startX;
        let yOffset = startY;

        function layout(node: any, depth = 0) {
            let children = node.children;
            let width = node.dimension.width;
            let height = node.dimension.height;

            // If there are no children, position the node and move right
            if (children.length === 0) {
                node.position.x = xOffset;
                node.position.y = yOffset + depth * (height + yGap);
                xOffset += width + xGap;
                return node.position.x;
            }

            // Position children first
            let childXPositions = children.map((child: any) =>
                layout(child, depth + 1),
            );

            // Center the parent node between its children
            let minX = Math.min(...childXPositions);
            let maxX = Math.max(...childXPositions);
            node.position.x = (minX + maxX) / 2;
            node.position.y = yOffset + depth * (height + yGap);

            return node.position.x;
        }

        nodes.forEach((node: any) => layout(node));
    }
}