import AgentConnection from "../common/agent/AgentConnection.js";
import MonitorAgentMessenger from "../common/agent/MonitorAgentMessenger.js";
import MarkdocCustomeElementToBFlowAgentMessenger from "./agent/MarkdocCustomeElementToBFlowAgentMessenger.js";
import BFlowToBFlowVizAgentMessenger from "./agent/BFlowToBFlowVizAgentMessenger.js";
import type AgentInfo from "$lib/common/agent/AgentInfo.js";
import _ from "lodash";
import { BFLowState } from "./BFlowState.js";

export default class BFlowDataProvider {

    private agentConnection?: AgentConnection;
    private monitorAgentMessenger?: MonitorAgentMessenger;
    private markdocCustomeElementToBFlowAgentMessenger?: MarkdocCustomeElementToBFlowAgentMessenger;
    private bflowToBFlowVizAgentMessenger?: BFlowToBFlowVizAgentMessenger;

    private agents: AgentInfo[] | undefined = [];
    public state: BFLowState = $state(BFLowState.NONE);
    public bflowviz: any = $state(null);

    private isBFlowBizLoading = $state(true);
    private bflowbizLoadingInfoMessage = $state("");
    private bflowbizLoadingErrorMessage = $state("");

    /**
     *
     */
    constructor() {
    }

    async connect(servers: string | string[], token: string) {
        this.state = BFLowState.CONNECTING;
        try {
            this.agentConnection = new AgentConnection({ name: "bflow" });

            await this.agentConnection.connect({
                servers: servers, // "ws://localhost:8080",
                token: token, //"76de3ba222bec3af21f9dbfb01f3197b",
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
            this.state = BFLowState.CONNECT_SUCCESS;
        } catch (exception) {
            this.state = BFLowState.CONNECT_FAILED;
        }
    }

    async disconnect() {
        try {
            await this.monitorAgentMessenger?.stop();
            await this.markdocCustomeElementToBFlowAgentMessenger?.stop();
            await this.bflowToBFlowVizAgentMessenger?.stop();
            await this.agentConnection?.stop();
        } catch { }

        this.state = BFLowState.NONE;
    }

    async loadBFlowViz(url: string, text: string) {
        console.log(`>>>> loadBFlowViz`);
        await this.loadAgents();
        const bflow = await this.convertMarkdocCustomElementToBFlow(url, text);
        if (bflow) {
            this.bflowviz = await this.convertBFlowToBFlowViz(bflow);
        }

        this.state = BFLowState.NONE;
    };

    async loadAgents() {
        this.state = BFLowState.LIST_AGENTS;

        // bflowbizLoadingInfoMessage = "Loading Agents";

        try {
            const result = await this.monitorAgentMessenger?.request({
                query: "list",
            });
            this.agents = result?.agents;
            this.state = BFLowState.LIST_AGENTS_SUCCESS;
        } catch (e: any) {
            console.log(">>>>> Error:", e);
            this.state = BFLowState.LIST_AGENTS_FAILED;
        }
    };

    async convertMarkdocCustomElementToBFlow(
        url: string,
        text: string,
    ) {
        this.state = BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW;
        // bflowbizLoadingInfoMessage = "Convert Markdoc Custom Element to BFlow";
        try {
            const bflowRes =
                await this.markdocCustomeElementToBFlowAgentMessenger?.request({
                    url,
                    text,
                    agents: this.agents,
                });
            this.state = BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_SUCCESS;
            return bflowRes?.bflow;
        } catch (e: any) {
            console.error(e);
            this.state = BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_FAILED;
            return null;
        }
    };

    async convertBFlowToBFlowViz(bflow: any) {
        this.state = BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW;
        // bflowbizLoadingInfoMessage = "Convert BFlow to BFlowViz";
        try {
            const bflowvizRes = await this.bflowToBFlowVizAgentMessenger?.request({
                bflow: bflow,
            });
            // TODO:
            // this.addDataPropertyToNodes(bflowvizRes?.bflowViz?.nodes);
            // const tree = this.buildTree(bflowvizRes?.bflowViz?.nodes);
            // this.calculatePositions(tree);
            this.state = BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_SUCCESS;
            return bflowvizRes?.bflowViz;
        } catch (e: any) {
            console.error(e);
            this.state = BFLowState.CONVERT_MARKDOC_ELEMENT_TO_BFLOW_FAILED;
            return null;
        }
    };
}