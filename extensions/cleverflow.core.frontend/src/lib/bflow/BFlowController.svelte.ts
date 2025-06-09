import _ from "lodash";
import { BFLowState } from "./BFlowState.js";
import Styles from './Styles.js';
import { addToast, ToastType } from '../common/components/toast/ToastStore.js';
import * as MarkocNodeUtil from '../common/utils/MarkdocNodeUtil.js';
import * as JsonUtil from '../common/utils/JsonUtil.js';
import { BFlowNodeState } from "./BFlowNodeState.js";
import { ConductorAgent } from "./agent/ConductorAgent.js";
import postal from "postal";
import type { Task, TaskSendParams } from "@cleverflow-ai/cleverflow.agents/schema";

export default class BFlowController {

    private conductorServerUrl: string;
    private conductorAgent?: ConductorAgent;

    public state: BFLowState = $state(BFLowState.NONE);
    public stateKey = $state(0);

    public bflow: any;
    public rawBFlow: any;
    public bflowviz: any = $state(null);
    public bflowRunResult: any = $state(null);

    private text: string | undefined;

    private bflowPostalChannel = postal.channel("b-flow");

    private dataId = 'empty-dataId';
    private sessionId = crypto.randomUUID();

    constructor(conductorServerUrl: string) {
        this.conductorServerUrl = conductorServerUrl;
    }

    async connect() {
        this.setState(BFLowState.CONNECTING);
        try {
            this.conductorAgent = new ConductorAgent(this.conductorServerUrl);
            const pong = await this.ping();
            if (!pong) {
                this.setState(BFLowState.CONNECT_FAILED);
                addToast("Failed to connect to the server", ToastType.ERROR);
                return false;
            }
            this.setState(BFLowState.CONNECT_SUCCESS);
            return true;
        } catch (exception) {
            console.error("Failed to connect to the server:", exception);
            this.setState(BFLowState.CONNECT_FAILED);
            return false;
        }
    }

    async disconnect() {
        try {
            this.conductorAgent = undefined;
        } catch { }

        this.setState(BFLowState.NONE);
    }

    async ping() {
        console.log("Pinging the server...");
        try {
            const isServerAnswered = await this.conductorAgent?.ping();
            console.log("Server ping response:", isServerAnswered);
            if (!isServerAnswered) {
                this.setState(BFLowState.CONNECT_FAILED);
                addToast("Failed to connect to the server", ToastType.ERROR);
                return false;
            }
            return true;
        } catch (exception) {
            console.error("Failed to ping the server:", exception);
            return false;
        }
    }

    setState(state: BFLowState) {
        this.state = state;
        this.stateKey += 1;
    }


    isDocumentChanged(text: string) {
        if (this.text === undefined) {
            return false;
        }
        return this.text !== text;
    }

    async generateBFlow(text: string) {
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

                const taskResult = await this.runGenerateBFlow();

                this.bflow = taskResult?.bflow;
                this.setState(BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_SUCCESS);

                this.bflowviz = taskResult?.bflowviz;
                if (this.bflowviz) {
                    this.addDataPropertyToNodes(this.bflowviz.nodes);
                    const tree = this.buildTree(this.bflowviz.nodes);
                    this.calculatePositions(tree);
                    this.setState(BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_SUCCESS);
                }
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

    async runGenerateBFlow() {
        return new Promise((resolve, reject) => {
            const taskParams: TaskSendParams = {
                id: `${this.dataId}|${this.sessionId}|generate-bflow`,
                message: {
                    role: "user",
                    parts: [{
                        type: 'text',
                        text: this.text ?? ''
                    }],
                },
            };
            console.log(`>>> send task`);
            console.log(taskParams);
            this.conductorAgent?.sendTask(taskParams, (event: Task) => {
                const state = event.status?.state;
                if (state === 'completed') {
                    const bflow = event.status?.message?.parts?.[0]?.data?.bflow;
                    const bflowviz = event.status?.message?.parts?.[0]?.data?.bflowViz;
                    resolve({
                        bflow, bflowviz,
                    });
                } else if (state === 'failed') {
                    reject(new Error("Failed to convert text to BFlow"));
                } else if (state === 'working') {
                    const text = event.status?.message?.parts?.[0]?.text;
                    console.log("Working on converting text to BFlow:", text);
                    if (text in BFLowState) {
                        const state = BFLowState[text as keyof typeof BFLowState];
                        this.setState(state);
                    }
                } else {
                    reject(new Error(`Unexpected state: ${state}`));
                }
            });
        });

    }

    // async createBFlowRunnerAgent() {
    //     let creatingBFlowRunnerAgentMessenger: BFlowRunnerAgentMessenger | null = new BFlowRunnerAgentMessenger({
    //         connection: this.agentConnection,
    //     });
    //     const subject = await creatingBFlowRunnerAgentMessenger.create();

    //     this.bflowRunnerAgentMessenger = new BFlowRunnerAgentMessenger({
    //         connection: this.agentConnection,
    //         subject: subject ?? undefined, // ?
    //         onProcess: (payload) => {
    //             if (payload.guiEnabled) {
    //                 if (payload.guiData) {
    //                     addToast("Server want to show a web component", ToastType.WARNING);
    //                     this.bflowPostalChannel.publish("show-server-web-component", {
    //                         guiData: payload.guiData
    //                     });
    //                 } else {
    //                     addToast("Server want to show a web component but GUI data was missing", ToastType.ERROR);
    //                 }
    //             } else {
    //                 this.bflow = payload.bflow;
    //                 this.bflowRunResult = payload.outs;
    //                 this.updateBFlowRunResult();
    //                 this.setState(payload.isFinished ? BFLowState.RUN_BFLOW_SUCCESS : BFLowState.RUN_BFLOW_IN_PROGRESS);
    //             }
    //         }
    //     });

    //     await this.bflowRunnerAgentMessenger.start();

    //     creatingBFlowRunnerAgentMessenger = null;
    // }

    async runBFlow() {
        if (this.state === BFLowState.RUN_BFLOW) {
            return;
        }

        this.setState(BFLowState.RUN_BFLOW);

        try {
            const taskParams: TaskSendParams = {
                id: crypto.randomUUID(),
                message: {
                    role: "user",
                    parts: [{
                        type: "data",
                        data: {
                            bflow: this.rawBFlow,
                        },
                    }],
                },
                metadata: {
                    taskName: "run-bflow",
                },
            };
            this.conductorAgent?.sendTask(taskParams, (event: Task) => {
                const state = event.status?.state;
                if (state === 'completed') {
                    console.log(">>> BFlow run completed successfully");
                    // const bflow = event.status?.message?.parts?.[0]?.data?.bflow;
                    // const bflowviz = event.status?.message?.parts?.[0]?.data?.bflowViz;
                    this.setState(BFLowState.RUN_BFLOW_SUCCESS);
                    this.bflow = event.status?.message?.parts?.[0]?.data?.bflow;
                    this.bflowRunResult = event.status?.message?.parts?.[0]?.data?.outs;
                    this.updateBFlowRunResult();
                    addToast("Successfully ran BFlow", ToastType.SUCCESS);
                } else if (state === 'failed') {
                    console.error(">>> BFlow run failed");
                    this.setState(BFLowState.RUN_BFLOW_FAILED);
                    addToast("Failed to run BFlow", ToastType.ERROR);
                } else if (state === 'working') {
                    const text = event.status?.message?.parts?.[0]?.text;
                    console.log("Working on converting text to BFlow:", text);
                    if (text in BFLowState) {
                        const state = BFLowState[text as keyof typeof BFLowState];
                        this.setState(state);
                    }
                } else {
                    console.error(`Unexpected state: ${state}`);
                    this.setState(BFLowState.RUN_BFLOW_FAILED);
                    addToast("Unexpected state while running BFlow", ToastType.ERROR);
                }
            });
            // const runningBflowResult = await this.bflowRunnerAgentMessenger?.run(this.rawBFlow);
            // if (runningBflowResult) {
            //     this.onRunBFlowFinished(runningBflowResult);
            // } else {
            //     this.setState(BFLowState.RUN_BFLOW_FAILED);
            //     addToast("Failed to run BFlow", ToastType.ERROR)
            // }
        } catch (e: any) {
            console.error(e);
            this.setState(BFLowState.RUN_BFLOW_FAILED);
            addToast("Failed to run BFlow", ToastType.ERROR)
        }
    }

    // async resumeBFlow() {
    //     if (this.state === BFLowState.RUN_BFLOW) {
    //         return;
    //     }

    //     this.setState(BFLowState.RUN_BFLOW);

    //     try {

    //         const runningBflowResult = await this.bflowRunnerAgentMessenger?.run(this.bflow, this.bflowRunResult);
    //         if (runningBflowResult) {
    //             this.onRunBFlowFinished(runningBflowResult);
    //         } else {
    //             this.setState(BFLowState.RUN_BFLOW_FAILED);
    //             addToast("Failed to run BFlow", ToastType.ERROR)
    //         }
    //     } catch (e: any) {
    //         console.error(e);
    //         this.setState(BFLowState.RUN_BFLOW_FAILED);
    //         addToast("Failed to run BFlow", ToastType.ERROR)
    //     }
    // }

    // onRunBFlowFinished(runningBflowResult: any) {
    //     this.bflow = runningBflowResult.bflow;
    //     this.bflowRunResult = runningBflowResult.outs;
    //     this.updateBFlowRunResult();

    //     const clientActionRequiredNode = this.findClientActionRequiredNode(runningBflowResult.bflow.root);
    //     if (clientActionRequiredNode) {
    //         this.setState(BFLowState.RUN_BFLOW_IN_PROGRESS);
    //         addToast("Server requires an action from you", ToastType.WARNING);
    //         // this.doActionRequired(clientActionRequiredNode);
    //     } else {
    //         this.setState(BFLowState.RUN_BFLOW_SUCCESS);
    //         addToast("Successfully ran BFlow", ToastType.SUCCESS);
    //     }
    // }

    updateBFlowRunResult() {
        if (!this.bflowRunResult) {
            return;
        }
        const root = this.bflow?.root;
        this.updateBFlowNodeResult(root);
    }

    updateBFlowNodeResult(node: any) {
        const vizNode = _.find(this.bflowviz.nodes, (vizNode: any) => {
            return node.id === vizNode.id;
        });
        if (vizNode) {
            vizNode.data.state = node.state;
        }
        if (node.goto && node.goto.length > 0) {
            _.forEach(node.goto, (childNode: any) => {
                this.updateBFlowNodeResult(childNode);
            });
        }
    }

    findClientActionRequiredNode(node: any): any {
        if (node.state === BFlowNodeState.WAITING_FOR_CLIENT) {
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

    doActionRequired(node: any) {
        switch (node.name.toLowerCase()) {
            case 'upload-file':
                this.bflowPostalChannel.publish("upload-file", {
                    node
                });
                break;
        }
    }

    addNodeResult(node: any, data: any) {
        if (!this.bflowRunResult) {
            this.bflowRunResult = {};
        }

        const input: any = {};
        input[node.id] = {
            result: data,
        };
        this.bflowRunResult = { ...this.bflowRunResult, ...input };
    }

    isStateLoading() {
        return (
            this.state === BFLowState.CONNECTING ||
            this.state === BFLowState.LIST_AGENTS ||
            this.state === BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW ||
            this.state === BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ ||
            this.state === BFLowState.RUN_BFLOW ||
            this.state === BFLowState.RUN_BFLOW_IN_PROGRESS
        );
    };

    isFailedState() {
        return (
            this.state === BFLowState.CONNECT_FAILED ||
            this.state === BFLowState.LIST_AGENTS_FAILED ||
            this.state === BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_FAILED ||
            this.state === BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_FAILED ||
            this.state === BFLowState.RUN_BFLOW_FAILED
        );
    };

    isFinishedState() {
        return (
            this.state === BFLowState.CONNECT_SUCCESS ||
            this.state === BFLowState.LIST_AGENTS_SUCCESS ||
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