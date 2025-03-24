import { AgentConnection, AgentMessenger, type AgentInfo } from "@cleverflow/cleverflow.core";

export type InPayload = {
    text: string;
    url: string;
    agents: AgentInfo[] | undefined,
}

export type OutPayload = {
    bflow: any;
}

/**
 * @class MarkdocCustomElementToBFlowAgent
 * @extends WSAgent<InPayload, OutPayload>
 * 
 * This class is responsible for converting Markdoc custom elements to BFlow format.
 * It extends the generic WSAgent class with input payload type `InPayload` and output payload type `OutPayload`.
 * 
 * @example
 * const agent = new MarkdocCustomElementToBFlowAgent();
 * const result = await agent.process({ text: 'some markdoc text' });
 * console.log(result.bflow);
 * 
 * @method constructor
 * Initializes a new instance of the MarkdocCustomElementToBFlowAgent class with a predefined name.
 * 
 * @method process
 * Processes the input payload to convert Markdoc custom elements to BFlow format.
 * 
 * @param {InPayload} payload - The input payload containing the text to be processed.
 * @returns {Promise<OutPayload>} - A promise that resolves to the output payload containing the BFlow data.
 * 
 * @async
 * @protected
 */
export default class MarkdocCustomeElementToBFlowAgentMessenger extends AgentMessenger<InPayload, OutPayload> {

    /**
     * Initializes a new instance of the MarkdocCustomElementToBFlowAgent class.
     * Sets the agent name to 'markdoc-custom-element-to-bflow'.
     */
    constructor(config: Partial<{ connection: AgentConnection }>) {
        super({ connection: config.connection, subject: 'markdoc-custom-element-to-bflow' });
    }

    /**
     * Send a request to the BFlow service to convert Markdoc custom elements to BFlow format.
     * 
     * @param {InPayload} payload - The input payload containing the text to be processed.
     * @returns {Promise<OutPayload>} - A promise that resolves to the output payload containing the BFlow data.
     * @async
     * @protected
     */
    public async request(payload: InPayload): Promise<OutPayload> {
        return await super.request(payload);
    }


    protected async process(payload: InPayload): Promise<OutPayload> {
        throw new Error("Method not implemented.");
    }

}