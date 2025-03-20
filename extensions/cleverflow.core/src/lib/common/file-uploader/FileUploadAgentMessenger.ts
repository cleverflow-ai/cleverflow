import { JSONCodec } from "nats";
import AgentConnection from "../agent/AgentConnection.js";
import AgentMessenger from "../agent/AgentMessager.js";

export type InPayload = {
    data?: string | null
}

export type OutPayload = {
    data: string,
}

/**
 * @class BFlowRunnerAgentMessenger
 * @extends AgentMessenger<InPayload, OutPayload>
 * @classdesc The BFlowRunnerAgentMessenger class is responsible for sending requests to the BFlow service to convert BFlow data to BFlowViz format.
 * 
 * @template InPayload - The type of the input payload containing the BFlow data to be processed.
 * @template OutPayload - The type of the output payload containing the BFlowViz data.
 */
export default class FileUploadAgentMessenger extends AgentMessenger<InPayload, OutPayload> {

    private onProcessCallback: (payload: any) => OutPayload;
    /**
     * Initializes a new instance of the BFlowRunnerAgentMessenger class.
     * Sets the agent subject to 'bflow-to-bflowviz'.
     * 
     * @param {Partial<{ connection: AgentConnection }>} config - The configuration object containing the agent connection.
     */
    constructor(config: Partial<{ connection: AgentConnection, subject?: string | null, onProcess: (payload: any) => OutPayload }>) {
        super({ connection: config.connection, subject: config.subject ?? 'file-uploader' });
        this.onProcessCallback = config.onProcess ?? (() => {
            console.log('>>>> call fallback function');
            return {} as OutPayload;
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
        return this.onProcessCallback(payload);
    }
}