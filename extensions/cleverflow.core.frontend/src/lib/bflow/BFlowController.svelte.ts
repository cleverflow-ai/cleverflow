import { AgentConnection, MonitorAgentMessenger, type AgentInfo } from "@cleverflow/cleverflow.core";
import MarkdocCustomeElementToBFlowAgentMessenger from "./agent/MarkdocCustomeElementToBFlowAgentMessenger.js";
import BFlowToBFlowVizAgentMessenger from "./agent/BFlowToBFlowVizAgentMessenger.js";
import _ from "lodash";
import { BFLowState } from "./BFlowState.js";
import BFlowRunnerAgentMessenger from "./agent/BFlowRunnerAgentMessenger.js";
import Styles from './Styles.js';
import { addToast, ToastType } from '../common/components/toast/ToastStore.js';
import * as MarkocNodeUtil from '../common/utils/MarkdocNodeUtil.js';
import * as JsonUtil from '../common/utils/JsonUtil.js';
import { BFlowNodeState } from "./agent/models/BFlowNodeState.js";
import postal from "postal";

export default class BFlowController {

    private servers: string | string[] = "";
    private token: string = "";

    private agentConnection?: AgentConnection;
    private monitorAgentMessenger?: MonitorAgentMessenger;
    private markdocCustomeElementToBFlowAgentMessenger?: MarkdocCustomeElementToBFlowAgentMessenger;
    private bflowToBFlowVizAgentMessenger?: BFlowToBFlowVizAgentMessenger;
    private bflowRunnerAgentMessenger?: BFlowRunnerAgentMessenger;

    public state: BFLowState = $state(BFLowState.NONE);
    public stateKey = $state(0);

    private agents: AgentInfo[] | undefined = [];
    public bflow: any;
    public rawBFlow: any;
    public bflowviz: any = $state(null);
    public bflowRunResult: any = $state(null);

    private url: string | undefined;
    private text: string | undefined;

    private bflowPostalChannel = postal.channel("b-flow");

    constructor(servers: string | string[], token: string) {
        this.servers = servers;
        this.token = token;
    }

    async connect() {
        this.setState(BFLowState.CONNECTING);
        try {
            this.agentConnection = new AgentConnection({ name: "bflow" });

            await this.agentConnection.connect({
                servers: this.servers,
                token: this.token,
            });

            this.monitorAgentMessenger = new MonitorAgentMessenger({
                connection: this.agentConnection,
            });

            this.markdocCustomeElementToBFlowAgentMessenger =
                new MarkdocCustomeElementToBFlowAgentMessenger({
                    connection: this.agentConnection,
                });
            this.bflowToBFlowVizAgentMessenger = new BFlowToBFlowVizAgentMessenger({
                connection: this.agentConnection,
            });
            this.bflowRunnerAgentMessenger = new BFlowRunnerAgentMessenger({
                connection: this.agentConnection,
            });

            this.setState(BFLowState.CONNECT_SUCCESS);
        } catch (exception) {
            this.setState(BFLowState.CONNECT_FAILED);
        }
    }

    async disconnect() {
        try {
            await this.monitorAgentMessenger?.stop();
            await this.markdocCustomeElementToBFlowAgentMessenger?.stop();
            await this.bflowToBFlowVizAgentMessenger?.stop();
            await this.agentConnection?.stop();
        } catch { }

        this.setState(BFLowState.NONE);
    }

    setState(state: BFLowState) {
        this.state = state;
        this.stateKey += 1;
    }


    isDocumentChanged(url: string, text: string) {
        if (this.url === undefined || this.text === undefined) {
            return false;
        }
        return this.url !== url || this.text !== text;
    }

    async loadBFlowViz(url: string, text: string) {
        this.url = url;
        this.text = text;
        this.bflowviz = null;

        const result = this.extractGeneratedData(text);

        if (result.agents) {
            this.agents = result.agents;
            this.setState(BFLowState.LIST_AGENTS_SUCCESS);
        } else {
            this.agents = await this.loadAgents();
        }

        if (result.bflow) {
            this.bflow = result.bflow;
            this.setState(BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_SUCCESS);
        } else {
            this.bflow = await this.convertMarkdocCustomElementToBFlow(url, text);
        }

        if (this.bflow) {
            this.rawBFlow = JSON.parse(JSON.stringify(this.bflow));
        }

        if (result.bflowviz) {
            this.addDataPropertyToNodes(result.bflowviz.nodes);
            const tree = this.buildTree(result.bflowviz.nodes);
            this.calculatePositions(tree);
            this.bflowviz = result.bflowviz;
            this.setState(BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_SUCCESS);
        } else {
            if (this.bflow) {
                this.bflowviz = await this.convertBFlowToBFlowViz(this.bflow);
            }
        }

        if (this.bflowviz && result.outs) {
            this.bflowRunResult = result.outs;
            this.updateBFlowRunResult();
            this.setState(BFLowState.RUN_BFLOW_SUCCESS);
        }
    };

    private extractGeneratedData(content: string): any {
        const result = {
            agents: null,
            bflow: null,
            bflowviz: null,
            outs: null,
        };
        try {
            const generatedData = MarkocNodeUtil.getNodeByName(content, 'generated-data');
            if (!generatedData) {
                return result;
            }

            let agentsContent = MarkocNodeUtil.extractNodeContent(generatedData, 'agents');
            agentsContent = JsonUtil.fixJsonString(agentsContent ?? '');

            if (agentsContent) {
                result.agents = JSON.parse(agentsContent);
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

    async loadAgents() {
        this.setState(BFLowState.LIST_AGENTS);

        try {
            const result = await this.monitorAgentMessenger?.request({
                query: "list",
            });

            this.setState(BFLowState.LIST_AGENTS_SUCCESS);
            return result?.agents;
        } catch (e: any) {
            console.log(">>>>> Error:", e);
            this.setState(BFLowState.LIST_AGENTS_FAILED);
        }
    };

    async convertMarkdocCustomElementToBFlow(
        url: string,
        text: string,
    ) {
        this.setState(BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW);
        try {
            const bflowRes =
                await this.markdocCustomeElementToBFlowAgentMessenger?.request({
                    url,
                    text,
                    agents: this.agents,
                });
            this.setState(BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_SUCCESS);
            return bflowRes?.bflow;
        } catch (e: any) {
            console.error(e);
            this.setState(BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_FAILED);
            return null;
        }
    };

    async convertBFlowToBFlowViz(bflow: any) {
        this.setState(BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ);
        try {
            const bflowvizRes = await this.bflowToBFlowVizAgentMessenger?.request({
                bflow: bflow,
            });
            this.addDataPropertyToNodes(bflowvizRes?.bflowViz?.nodes);
            const tree = this.buildTree(bflowvizRes?.bflowViz?.nodes);
            this.calculatePositions(tree);
            this.setState(BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_SUCCESS);
            return bflowvizRes?.bflowViz;
        } catch (e: any) {
            console.error(e);
            this.setState(BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_FAILED);
            return null;
        }
    };

    async createBFlowRunnerAgent() {
        let creatingBFlowRunnerAgentMessenger: BFlowRunnerAgentMessenger | null = new BFlowRunnerAgentMessenger({
            connection: this.agentConnection,
        });
        const subject = await creatingBFlowRunnerAgentMessenger.create();

        this.bflowRunnerAgentMessenger = new BFlowRunnerAgentMessenger({
            connection: this.agentConnection,
            subject: subject ?? undefined, // ?
            onProcess: (payload) => {
                this.bflow = payload.bflow;
                this.bflowRunResult = payload.outs;
                this.updateBFlowRunResult();
                this.setState(BFLowState.RUN_BFLOW_IN_PROGRESS);
                addToast("BFlow is running", ToastType.WARNING);
            }
        });

        await this.bflowRunnerAgentMessenger.start();

        creatingBFlowRunnerAgentMessenger = null;
    }

    async runBFlow() {
        if (this.state === BFLowState.RUN_BFLOW) {
            return;
        }

        await this.createBFlowRunnerAgent();

        this.setState(BFLowState.RUN_BFLOW);

        try {
            const runningBflowResult = await this.bflowRunnerAgentMessenger?.run(this.rawBFlow);
            if (runningBflowResult) {
                this.onRunBFlowFinished(runningBflowResult);
            } else {
                this.setState(BFLowState.RUN_BFLOW_FAILED);
                addToast("Failed to run BFlow", ToastType.ERROR)
            }
        } catch (e: any) {
            console.error(e);
            this.setState(BFLowState.RUN_BFLOW_FAILED);
            addToast("Failed to run BFlow", ToastType.ERROR)
        }
    }

    async resumeBFlow() {
        if (this.state === BFLowState.RUN_BFLOW) {
            return;
        }

        this.setState(BFLowState.RUN_BFLOW);

        try {

            const runningBflowResult = await this.bflowRunnerAgentMessenger?.run(this.bflow, this.bflowRunResult);
            if (runningBflowResult) {
                this.onRunBFlowFinished(runningBflowResult);
            } else {
                this.setState(BFLowState.RUN_BFLOW_FAILED);
                addToast("Failed to run BFlow", ToastType.ERROR)
            }
        } catch (e: any) {
            console.error(e);
            this.setState(BFLowState.RUN_BFLOW_FAILED);
            addToast("Failed to run BFlow", ToastType.ERROR)
        }
    }

    onRunBFlowFinished(runningBflowResult: any) {
        this.bflow = runningBflowResult.bflow;
        this.bflowRunResult = runningBflowResult.outs;
        this.updateBFlowRunResult();

        const clientActionRequiredNode = this.findClientActionRequiredNode(runningBflowResult.bflow.root);
        if (clientActionRequiredNode) {
            this.setState(BFLowState.RUN_BFLOW_IN_PROGRESS);
            addToast("Server requires an action from you", ToastType.WARNING);
            this.doActionRequired(clientActionRequiredNode);
        } else {
            this.setState(BFLowState.RUN_BFLOW_SUCCESS);
            addToast("Successfully ran BFlow", ToastType.SUCCESS);
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