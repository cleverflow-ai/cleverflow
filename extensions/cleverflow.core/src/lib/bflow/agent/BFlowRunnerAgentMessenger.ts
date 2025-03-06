import { JSONCodec } from "nats";
import AgentConnection from "../../common/agent/AgentConnection.js";
import AgentMessenger from "../../common/agent/AgentMessager.js";

export type InPayload = {
    bflow: any
}

export type OutPayload = {
    bflow: any;
    outs: any;
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

    /**
     * Initializes a new instance of the BFlowRunnerAgentMessenger class.
     * Sets the agent subject to 'bflow-to-bflowviz'.
     * 
     * @param {Partial<{ connection: AgentConnection }>} config - The configuration object containing the agent connection.
     */
    constructor(config: Partial<{ connection: AgentConnection }>) {
        super({ connection: config.connection, subject: 'bflow-runner' });
    }

    /**
     * Sends a request to the BFlow service to convert BFlow data to BFlowViz format.
     * 
     * @param {InPayload} payload - The input payload containing the BFlow data to be processed.
     * @returns {Promise<OutPayload>} - A promise that resolves to the output payload containing the BFlowViz data.
     * @async
     */
    public async request(payload: InPayload): Promise<OutPayload> {
        if (this.connection) {
            return await this.connection.sendRequest<OutPayload>({
                subject: this.subject,
                payload: JSONCodec<InPayload>().encode(payload),
                options: {
                    timeout: 3600 * 1000 // 1 hour 
                },
            });
        } else {
            throw new Error('Connection is not established');
        }
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
        throw new Error("Method not implemented.");
    }

}