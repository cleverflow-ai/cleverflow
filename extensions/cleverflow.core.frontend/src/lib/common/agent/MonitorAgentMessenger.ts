import { JSONCodec } from "nats";
import AgentConnection from "./AgentConnection.js";
import type AgentInfo from "./AgentInfo.js";
import AgentMessenger from "./AgentMessager.js";

export type InPayload = {
    query: string,
}

export type OutPayload = {
    agents: AgentInfo[];
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
/**
 * @file MonitorAgentMessenger.ts
 * @description This file contains the definition of the MonitorAgentMessenger class, which extends the AgentMessenger class.
 * The MonitorAgentMessenger class is responsible for sending requests to the BFlow service to convert Markdoc custom elements to BFlow format.
 * 
 * @module MonitorAgentMessenger
 */

 /**
 * @class MonitorAgentMessenger
 * @extends {AgentMessenger<InPayload, OutPayload>}
 * @classdesc The MonitorAgentMessenger class is responsible for sending requests to the BFlow service to convert Markdoc custom elements to BFlow format.
 * 
 * @template InPayload - The type of the input payload.
 * @template OutPayload - The type of the output payload.
 * 
 * @example
 * const messenger = new MonitorAgentMessenger({ connection: agentConnection });
 * const result = await messenger.request(inputPayload);
 * 
 * @param {Partial<{ connection: AgentConnection }>} config - The configuration object containing the agent connection.
 * 
 * @throws {Error} Throws an error if the connection is not established.
 */
export default class MonitorAgentMessenger extends AgentMessenger<InPayload, OutPayload> {
    
    /**
     * Initializes a new instance of the MarkdocCustomElementToBFlowAgent class.
     * Sets the agent name to 'markdoc-custom-element-to-bflow'.
     */
    constructor(config: Partial<{ connection: AgentConnection }>) {
        super({ connection: config.connection, subject: 'monitor-all-agents' });
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
        if(this.connection){
            return await this.connection.sendRequest<OutPayload>({
                subject: this.subject,
                payload: JSONCodec<InPayload>().encode(payload),
                options: {
                    timeout: 3600*1000 // 1 hour 
                }, 
            });
        }else {
            throw new Error('Connection is not established');
        }
    }


    protected async process(payload: InPayload): Promise<OutPayload> {
        throw new Error("Method not implemented.");
    }

}