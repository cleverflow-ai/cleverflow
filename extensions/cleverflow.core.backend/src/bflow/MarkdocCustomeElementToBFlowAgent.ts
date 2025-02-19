import { b } from '../baml_client/async_client.js';
import { BFlow } from '../baml_client/types.js';
import Agent from "../common/Agent.js";
import Clients from '../baml/Clients.js';

export type InPayload = {
    text: string;
}

export type OutPayload = {
    bflow: BFlow;
}

/**
 * @class MarkdocCustomElementToBFlowAgent
 * @extends Agent<InPayload, OutPayload>
 * 
 * This class is responsible for converting Markdoc custom elements to BFlow format.
 * It extends the generic Agent class with input payload type `InPayload` and output payload type `OutPayload`.
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
export default class MarkdocCustomElementToBFlowAgent extends Agent<InPayload, OutPayload> {
    /**
     * Initializes a new instance of the MarkdocCustomElementToBFlowAgent class.
     * Sets the agent name to 'markdoc-custom-element-to-bflow'.
     */
    constructor() {
        super({ name: 'markdoc-custom-element-to-bflow' });
    }

    /**
     * Processes the input payload to convert Markdoc custom elements to BFlow format.
     * 
     * @param {InPayload} payload - The input payload containing the text to be processed.
     * @returns {Promise<OutPayload>} - A promise that resolves to the output payload containing the BFlow data.
     * @async
     * @protected
     */
    protected async process(payload: InPayload): Promise<OutPayload> {
        const bflow = await b.ParseMarkdocBFlowElementToBFlow(
            payload.text, 
            { 
                clientRegistry: new Clients({ primary: Clients.OllamaTool }).registry 
            });
        
        return { bflow: bflow };
    }
}