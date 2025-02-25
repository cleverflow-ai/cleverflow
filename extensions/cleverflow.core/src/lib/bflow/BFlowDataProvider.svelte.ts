import AgentConnection from "../common/agent/AgentConnection.js";
import MonitorAgentMessenger from "../common/agent/MonitorAgentMessenger.js";
import MarkdocCustomeElementToBFlowAgentMessenger from "./agent/MarkdocCustomeElementToBFlowAgentMessenger.js";
import BFlowToBFlowVizAgentMessenger from "./agent/BFlowToBFlowVizAgentMessenger.js";
import type AgentInfo from "$lib/common/agent/AgentInfo.js";
import _ from "lodash";
import { BFLowState } from "./BFlowState.js";

export default class BFlowDataProvider {

    private servers: string | string[] = "";
    private token: string = "";

    private agentConnection?: AgentConnection;
    private monitorAgentMessenger?: MonitorAgentMessenger;
    private markdocCustomeElementToBFlowAgentMessenger?: MarkdocCustomeElementToBFlowAgentMessenger;
    private bflowToBFlowVizAgentMessenger?: BFlowToBFlowVizAgentMessenger;

    private agents: AgentInfo[] | undefined = [];
    public state: BFLowState = $state(BFLowState.NONE);
    public bflowviz: any = $state(null);

    private url: string | undefined;
    private text: string | undefined;

    private onStateChanged: (state: BFLowState) => void = () => { };


    constructor(servers: string | string[], token: string, onStateChanged?: (state: BFLowState) => void) {
        this.servers = servers;
        this.token = token;
        this.onStateChanged = onStateChanged || (() => { });
    }

    async connect() {
        this.setState(BFLowState.CONNECTING);
        try {
            this.agentConnection = new AgentConnection({ name: "bflow" });

            await this.agentConnection.connect({
                servers: this.servers, // "ws://localhost:8080",
                token: this.token, //"76de3ba222bec3af21f9dbfb01f3197b",
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
        this.onStateChanged(state);
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
        await this.loadAgents();
        const bflow = await this.convertMarkdocCustomElementToBFlow(url, text);
        if (bflow) {
            this.bflowviz = await this.convertBFlowToBFlowViz(bflow);
        }
    };

    async loadAgents() {
        this.setState(BFLowState.LIST_AGENTS);

        try {
            const result = await this.monitorAgentMessenger?.request({
                query: "list",
            });
            this.agents = result?.agents;
            this.setState(BFLowState.LIST_AGENTS_SUCCESS);
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

    isStateLoading() {
        return (
            this.state === BFLowState.CONNECTING ||
            this.state === BFLowState.LIST_AGENTS ||
            this.state === BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW ||
            this.state === BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ
        );
    };

    isFailedState() {
        return (
            this.state === BFLowState.CONNECT_FAILED ||
            this.state === BFLowState.LIST_AGENTS_FAILED ||
            this.state === BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_FAILED ||
            this.state === BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_FAILED
        );
    };

    isFinishedState() {
        return (
            this.state === BFLowState.CONNECT_SUCCESS ||
            this.state === BFLowState.LIST_AGENTS_SUCCESS ||
            this.state === BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_SUCCESS ||
            this.state === BFLowState.CONVERT_BFLOW_TO_BFLOWVIZ_SUCCESS
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
                if (node.type === "SEQUENCE") {
                    node.dimension = {
                        width: 50,
                        height: 50,
                    };
                } else {
                    node.dimension = {
                        width: 100,
                        height: 50,
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