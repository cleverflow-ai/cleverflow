import { JSONCodec } from "nats";
import AgentConnection from "../../common/agent/AgentConnection.js";
import AgentMessenger from "../../common/agent/AgentMessager.js";

enum ACTION {
    CREATE = 'create',
    RUN = 'run',
}

export type InPayload = {
    action: ACTION,
    bflow?: any
}

export type OutPayload = {
    subject?: string,
    bflow?: any;
    outs?: any;
}

/**
 * @class BFlowRunnerAgentMessenger
 * @extends AgentMessenger<InPayload, OutPayload>
 * @classdesc The BFlowRunnerAgentMessenger class is responsible for sending requests to the BFlow service to convert BFlow data to BFlowViz format.
 * 
 * @template InPayload - The type of the input payload containing the BFlow data to be processed.
 * @template OutPayload - The type of the output payload containing the BFlowViz data.
 */
export default class BFlowRunnerAgentMessenger extends AgentMessenger<InPayload, OutPayload> {

    private onProcess: (payload: any) => void;
    /**
     * Initializes a new instance of the BFlowRunnerAgentMessenger class.
     * Sets the agent subject to 'bflow-to-bflowviz'.
     * 
     * @param {Partial<{ connection: AgentConnection }>} config - The configuration object containing the agent connection.
     */
    constructor(config: Partial<{ connection: AgentConnection, subject?: string, onProcess: (payload: any) => void }>) {
        super({ connection: config.connection, subject: config.subject ?? 'bflow-runner' });
        this.onProcess = config.onProcess ?? (() => { });
    }

    public async create(): Promise<string | null | undefined> {
        const result = await this.request({
            action: ACTION.CREATE,
        });
        return result?.subject;
    }

    public async run(bflow: any): Promise<OutPayload> {
        return await this.request({
            action: ACTION.RUN,
            bflow: bflow,
        });
    }

    /**
     * This method is not implemented and will throw an error if called.
     * 
     * @param {InPayload} payload - The input payload containing the BFlow data to be processed.
     * @returns {Promise<OutPayload>} - A promise that resolves to the output payload containing the BFlowViz data.
     * @async
     * @protected
     */
    protected async process(payload: InPayload): Promise<OutPayload> {
        this.onProcess(payload);
        return {};
    }
}