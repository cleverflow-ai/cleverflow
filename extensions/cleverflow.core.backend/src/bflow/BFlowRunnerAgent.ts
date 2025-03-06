import { BFlow, BFlowNode, BFlowNodeState, BFlowNodeType } from "../baml_client/types.js";
import Agent from "../common/Agent.js";

export type InPayload = {
    bflow: BFlow;
}

export type OutPayload = {
    bflow: BFlow;
    outs: {}
}

/**
 * Class representing a BFlowRunnerAgent which extends the Agent class.
 * This class is responsible for running a given B-Flow.
 */
export default class BFlowRunnerAgent extends Agent<InPayload, OutPayload> {
    private _outs = new Map<string, any>();

    /**
     * Constructs a new BFlowRunnerAgent instance.
     */
    constructor() {
        super({
            name: 'bflow-runner',
            description: 'Run the given B-Flow.'
        });
    }

    /**
     * Processes the given payload by running the root node of the B-Flow.
     * @param payload - The input payload containing the B-Flow to be run.
     * @returns The output payload containing the B-Flow and the outputs of the nodes.
     */
    public async process(payload: InPayload): Promise<OutPayload> {
        await this.runNode(payload.bflow.root);
        return {
            bflow: payload.bflow,
            outs: Object.fromEntries(this._outs)
        }
    }

    /**
     * Runs a given B-Flow node and updates its state based on its type and the results of its children nodes.
     * @param node - The B-Flow node to be run.
     * @returns The state of the node after execution.
     */
    public async runNode(node: BFlowNode): Promise<BFlowNodeState> {
        if (node.type === BFlowNodeType.ENTRY) {
            for (const child of node.goto!) {
                const status = await this.runNode(child);
            }
        }

        if (node.type === BFlowNodeType.FALLBACK) {
            for (const child of node.goto!) {
                const status = await this.runNode(child);
                if (status === BFlowNodeState.SUCCESS) {
                    node.state = BFlowNodeState.SUCCESS
                    return node.state;
                }
            }

            node.state = BFlowNodeState.FAILURE;
            return node.state;
        }

        if (node.type === BFlowNodeType.SEQUENCE) {
            for (const child of node.goto!) {
                const status = await this.runNode(child);
                if (status === BFlowNodeState.FAILURE) {
                    node.state = BFlowNodeState.FAILURE;
                    return node.state;
                }
            }

            node.state = BFlowNodeState.SUCCESS;
            return node.state;
        }

        if (node.type === BFlowNodeType.ACTION || node.type === BFlowNodeType.CONDITION) {
            if (this.connection && node.agent) {
                let inputData = '';

                if (node.inputs) {
                    // Each Input corresponds a Node Name
                    for (const input of node.inputs) {
                        // Get saved Output of required Node
                        const out = this._outs.get(input);
                        if (out) {
                            inputData += typeof out === 'string' ? out : JSON.stringify(out);
                        }
                    }
                }

                node.state = BFlowNodeState.RUNNING;

                const reply = await this.connection.request(
                    node.agent.name,
                    this.codec.encode({
                        description: node.description,
                        config: node.config?.yaml,
                        input: inputData,
                    }),
                    {
                        timeout: 1000 * 3600
                    });
                const result = this.codec.decode(reply.data);
                if (node.id) {
                    this._outs.set(node.id, result);
                    node.state = BFlowNodeState.SUCCESS;
                    return node.state;
                }
            }

            return BFlowNodeState.FAILURE;
        }

        return BFlowNodeState.FAILURE;
    }
}