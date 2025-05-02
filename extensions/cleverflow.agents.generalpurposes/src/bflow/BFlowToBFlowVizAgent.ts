import { b } from '../baml_client/async_client.js';
import { BFlow, BFlowViz } from '../baml_client/types.js';
import { Agent } from "@cleverflow/cleverflow.core";
import Clients from '../baml/Clients.js';

export type InPayload = {
    bflow: BFlow;
}

export type OutPayload = {
    bflowViz: BFlowViz;
}

/**
 * @class BFlowToBFlowVizAgent
 * @extends Agent<InPayload, OutPayload>
 * 
 * This class is responsible for converting BFlow format to BFlowViz format.
 * It extends the generic Agent class with input payload type `InPayload` and output payload type `OutPayload`.
 * 
 * @example
 * const agent = new BFlowToBFlowVizAgent();
 * const result = await agent.process({ bflow: someBFlowObject });
 * console.log(result.bflowViz);
 * 
 * @method constructor
 * Initializes a new instance of the BFlowToBFlowVizAgent class with a predefined name.
 * 
 * @method process
 * Processes the input payload to convert BFlow format to BFlowViz format.
 * 
 * @param {InPayload} payload - The input payload containing the BFlow data to be processed.
 * @returns {Promise<OutPayload>} - A promise that resolves to the output payload containing the BFlowViz data.
 * 
 * @async
 * @protected
 */
export default class BFlowToBFlowVizAgent extends Agent<InPayload, OutPayload> {
    /**
     * Initializes a new instance of the BFlowToBFlowVizAgent class.
     * Sets the agent name to 'bflow-to-bflowviz'.
     */
    constructor() {
        super({
            name: 'bflow-to-bflowviz',
            description: 'Parse given B-Flow to the Visualization Format.'
        });
    }

    /**
     * Processes the input payload to convert BFlow format to BFlowViz format.
     * 
     * @param {InPayload} payload - The input payload containing the BFlow data to be processed.
     * @returns {Promise<OutPayload>} - A promise that resolves to the output payload containing the BFlowViz data.
     * @async
     * @public
     */
    public async process(payload: InPayload): Promise<OutPayload> {
        const bflowViz = await b.ParseBFlowToBFlowViz2(
            JSON.stringify(payload.bflow),
            {
                clientRegistry: new Clients({ primary: Clients.OllamaTool }).registry
            });

        return { bflowViz: bflowViz };
    }
}