import { AgentConnection, AgentMessenger } from "@cleverflow/cleverflow.core";

export type InPayload = {
    bflow: any
}

export type OutPayload = {
    bflowViz: any;
}

/**
 * @class BFlowToBFlowVizAgentMessenger
 * @extends AgentMessenger<InPayload, OutPayload>
 * 
 * This class is responsible for sending requests to convert BFlow data to BFlowViz format.
 * It extends the generic AgentMessenger class with input payload type `InPayload` and output payload type `OutPayload`.
 * 
 * @example
 * const agent = new BFlowToBFlowVizAgentMessenger({ connection: new AgentConnection() });
 * const result = await agent.request({ bflow: someBFlowData });
 * console.log(result.bflowViz);
 * 
 * @method constructor
 * Initializes a new instance of the BFlowToBFlowVizAgentMessenger class with a predefined subject.
 * 
 * @method request
 * Sends a request to the BFlow service to convert BFlow data to BFlowViz format.
 * 
 * @param {InPayload} payload - The input payload containing the BFlow data to be processed.
 * @returns {Promise<OutPayload>} - A promise that resolves to the output payload containing the BFlowViz data.
 * 
 * @method process
 * This method is not implemented and will throw an error if called.
 * 
 * @param {InPayload} payload - The input payload containing the BFlow data to be processed.
 * @returns {Promise<OutPayload>} - A promise that resolves to the output payload containing the BFlowViz data.
 * 
 * @async
 * @protected
 */
export default class BFlowToBFlowVizAgentMessenger extends AgentMessenger<InPayload, OutPayload> {

    /**
     * Initializes a new instance of the BFlowToBFlowVizAgentMessenger class.
     * Sets the agent subject to 'bflow-to-bflowviz'.
     * 
     * @param {Partial<{ connection: AgentConnection }>} config - The configuration object containing the agent connection.
     */
    constructor(config: Partial<{ connection: AgentConnection }>) {
        super({ connection: config.connection, subject: 'bflow-to-bflowviz' });
    }

    /**
     * Sends a request to the BFlow service to convert BFlow data to BFlowViz format.
     * 
     * @param {InPayload} payload - The input payload containing the BFlow data to be processed.
     * @returns {Promise<OutPayload>} - A promise that resolves to the output payload containing the BFlowViz data.
     * @async
     */
    public async request(payload: InPayload): Promise<OutPayload> {
        return await super.request(payload);
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