import { createInbox } from 'nats';
import { BFlow, BFlowNode, BFlowNodeState, BFlowNodeType } from "../baml_client/types.js";
import Agent from "../common/Agent.js";

enum ACTION {
    CREATE = 'create',
    RUN = 'run',
}

export type InPayload = {
    action: ACTION,
    bflow?: BFlow;
}

export type OutPayload = {
    subject?: string,
    bflow?: BFlow;
    outs?: {}
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
    constructor(config?: { name?: string }) {
        super({
            name: config?.name ?? 'bflow-runner',
            description: 'Run the given B-Flow.'
        });
    }

    /**
     * Processes the given payload by running the root node of the B-Flow.
     * @param payload - The input payload containing the B-Flow to be run.
     * @returns The output payload containing the B-Flow and the outputs of the nodes.
     */
    public async process(payload: InPayload): Promise<OutPayload> {
        switch (payload.action) {
            case ACTION.CREATE:
                const bflowRunnerAgent = new BFlowRunnerAgent({ name: `bflow-runner.${createInbox()}` });
                await bflowRunnerAgent.run({
                    servers: process.env.EVENTS_SERVER,
                    token: process.env.EVENTS_TOKEN,
                });
                return {
                    subject: bflowRunnerAgent.name,
                };
            case ACTION.RUN:
            default:
                if (payload.bflow) {
                    const onRunNodeProgress = async () => {
                        this.publish({
                            bflow: payload.bflow,
                            outs: Object.fromEntries(this._outs)
                        });
                    };
                    await this.runNode(payload.bflow.root, onRunNodeProgress);

                    return {
                        bflow: payload.bflow,
                        outs: Object.fromEntries(this._outs)
                    }
                } else {
                    return {};
                }
        }
    }

    /**
     * Runs a given B-Flow node and updates its state based on its type and the results of its children nodes.
     * @param node - The B-Flow node to be run.
     * @returns The state of the node after execution.
     */
    public async runNode(node: BFlowNode, onProgress: () => Promise<void>): Promise<BFlowNodeState> {
        if (node.type === BFlowNodeType.ENTRY) {
            for (const child of node.goto!) {
                const status = await this.runNode(child, onProgress);
            }
        }

        if (node.type === BFlowNodeType.FALLBACK) {
            for (const child of node.goto!) {
                const status = await this.runNode(child, onProgress);
                if (status === BFlowNodeState.SUCCESS) {
                    node.state = BFlowNodeState.SUCCESS;
                    await onProgress();
                    return node.state;
                }
            }

            node.state = BFlowNodeState.FAILURE;
            await onProgress();
            return node.state;
        }

        if (node.type === BFlowNodeType.SEQUENCE) {
            for (const child of node.goto!) {
                const status = await this.runNode(child, onProgress);
                if (status === BFlowNodeState.FAILURE) {
                    node.state = BFlowNodeState.FAILURE;
                    await onProgress();
                    return node.state;
                }
            }

            node.state = BFlowNodeState.SUCCESS;
            await onProgress();
            return node.state;
        }

        if (node.type === BFlowNodeType.ACTION || node.type === BFlowNodeType.CONDITION) {
            if (this.connection && node.agent) {
                let inputs: any[] = [];

                if (node.inputs) {
                    // Each Input corresponds a Node Id
                    for (const nodeId of node.inputs) {
                        // Get saved Output of required Node
                        const out = this._outs.get(nodeId);
                        const outResult = out?.result;
                        if (outResult) {
                            inputs.push(outResult);
                        }
                    }
                }

                node.state = BFlowNodeState.RUNNING;
                await onProgress();

                const reply = await this.connection.request(
                    `${node.agent.name}.server`,
                    this.codec.encode({
                        description: node.description,
                        config: node.config,
                        inputs: inputs,
                    }),
                    {
                        timeout: 1000 * 3600
                    });
                const result = this.codec.decode(reply.data);
                if (node.id) {
                    this._outs.set(node.id, result);
                    node.state = BFlowNodeState.SUCCESS;
                    await onProgress();
                    return node.state;
                }
            }

            return BFlowNodeState.FAILURE;
        }

        return BFlowNodeState.FAILURE;
    }
}