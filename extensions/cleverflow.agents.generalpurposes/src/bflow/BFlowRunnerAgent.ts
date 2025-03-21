import { createInbox } from 'nats';
import { monitorAgent } from '@cleverflow/cleverflow.core';
import { BFlow, BFlowNode, BFlowNodeState, BFlowNodeType } from "../baml_client/types.js";
import { Agent, type AgentInfo } from "@cleverflow/cleverflow.core";

export type InPayload = {
    query: 'create' | 'run' | 'loadGUI',
    bflow?: BFlow;
    outs?: {},
}

export type OutPayload = {
    isFinished?: boolean,
    subject?: string,
    bflow?: BFlow;
    outs?: {},
    gui?: any,
    error?: any,
}

/**
 * Class representing a BFlowRunnerAgent which extends the Agent class.
 * This class is responsible for running a given B-Flow.
 */
export default class BFlowRunnerAgent extends Agent<InPayload, OutPayload> {
    private _bflow: BFlow | undefined;
    private _outs = new Map<string, any>();
    private _waitingClientActionNodeId: string | undefined | null;

    /**
     * Constructs a new BFlowRunnerAgent instance.
     */
    constructor(config?: { name?: string }) {
        super({
            name: config?.name ?? 'bflow-runner',
            description: 'Run the given B-Flow.'
        });

        // setTimeout(async () => {
        //     const agent = await this.getAgentForAction('upload-file');
        //     if (agent) {
        //         await this.loadAgentGUI(agent);
        //     }
        // }, 10000);
    }

    /**
     * Processes the given payload by running the root node of the B-Flow.
     * @param payload - The input payload containing the B-Flow to be run.
     * @returns The output payload containing the B-Flow and the outputs of the nodes.
     */
    public async process(payload: InPayload): Promise<OutPayload> {
        switch (payload.query) {
            case 'create':
                const privateBFlowRunnerAgent = new BFlowRunnerAgent({ name: `bflow-runner.${createInbox()}` });
                await privateBFlowRunnerAgent.run({
                    servers: process.env.EVENTS_SERVER,
                    token: process.env.EVENTS_TOKEN,
                });
                privateBFlowRunnerAgent.isPrivate = true;
                monitorAgent.register(privateBFlowRunnerAgent);
                return {
                    subject: privateBFlowRunnerAgent.name,
                };
            case 'run':
                if (payload.outs) {
                    if (this._outs) {
                        for (const [key, value] of Object.entries(payload.outs)) {
                            this._outs.set(key, value);
                        }
                    } else {
                        this._outs = new Map(Object.entries(payload.outs));
                    }
                }
                if (payload.bflow) {
                    this._bflow = payload.bflow;

                    const onRunNodeProgress = async () => {
                        this.publish({
                            bflow: payload.bflow,
                            outs: Object.fromEntries(this._outs)
                        }, {});
                    };
                    await this.runNode(payload.bflow.root, {
                        onProgress: onRunNodeProgress,
                    });

                    return {
                        isFinished: true,
                        bflow: payload.bflow,
                        outs: Object.fromEntries(this._outs)
                    }
                }
                return {};
            // TESTING
            case 'loadGUI':
                const agent = await this.getAgentForAction('upload-file');
                if (agent) {
                    const gui = await this.loadAgentGUI(agent);
                    return {
                        gui: gui,
                    };
                }
                return {};
            default:
                return {
                    error: `${payload.query} is still not supported.`
                };
        }
    }

    public async onNotify(payload: any) {
        if (payload.session !== this.name) {
            return;
        }
        switch (payload.agentName) {
            case 'file-uploader':
                if (payload.action === 'processed' && this._waitingClientActionNodeId) {
                    this._outs.set(this._waitingClientActionNodeId, {
                        result: payload.data.filePath,
                    });

                    this._waitingClientActionNodeId = null;

                    if (this._bflow) {
                        await this.runNode(this._bflow.root, {
                            onProgress: async () => {
                                this.publish({
                                    bflow: this._bflow,
                                    outs: Object.fromEntries(this._outs)
                                }, {});
                            },
                        });
                        this.publish({
                            isFinished: true,
                            bflow: this._bflow,
                            outs: Object.fromEntries(this._outs)
                        }, {});
                    }

                }
                break;
        }
    }

    /**
     * Runs a given B-Flow node and updates its state based on its type and the results of its children nodes.
     * @param node - The B-Flow node to be run.
     * @returns The state of the node after execution.
     */
    public async runNode(node: BFlowNode, config: {
        onProgress: () => Promise<void>,
    }): Promise<BFlowNodeState> {

        if (node.state === BFlowNodeState.SUCCESS) {
            return node.state;
        }

        if (node.type === BFlowNodeType.ENTRY) {

            for (const child of node.goto!) {
                const status = await this.runNode(child, config);
                if (status === BFlowNodeState.WAITING_FOR_CLIENT) {
                    return BFlowNodeState.WAITING_FOR_CLIENT;
                }
            }

        } else if (node.type === BFlowNodeType.FALLBACK) {

            for (const child of node.goto!) {
                const status = await this.runNode(child, config);
                if (status === BFlowNodeState.SUCCESS) {
                    node.state = BFlowNodeState.SUCCESS;
                    await config.onProgress();
                    return node.state;
                } else if (status === BFlowNodeState.WAITING_FOR_CLIENT) {
                    return BFlowNodeState.WAITING_FOR_CLIENT;
                }
            }

            node.state = BFlowNodeState.FAILURE;
            await config.onProgress();
            return node.state;

        } else if (node.type === BFlowNodeType.SEQUENCE) {

            for (const child of node.goto!) {
                const status = await this.runNode(child, config);
                if (status === BFlowNodeState.FAILURE) {
                    node.state = BFlowNodeState.FAILURE;
                    await config.onProgress();
                    return node.state;
                } else if (status === BFlowNodeState.WAITING_FOR_CLIENT) {
                    return BFlowNodeState.WAITING_FOR_CLIENT;
                }
            }

            node.state = BFlowNodeState.SUCCESS;
            await config.onProgress();
            return node.state;

        } else if (node.type === BFlowNodeType.ACTION || node.type === BFlowNodeType.CONDITION) {

            if (this.isClientActionRequired(node)) {
                if (this.hasNodeResult(node)) {
                    node.state = BFlowNodeState.SUCCESS;
                } else {
                    const candidateAgent = await this.getAgentForAction(node.name ?? '');
                    if (candidateAgent && candidateAgent.guiEnabled) {
                        const guiData = await this.loadAgentGUI(candidateAgent);
                        if (guiData) {
                            this.publish({
                                guiEnabled: true,
                                guiData: guiData
                            }, {});
                        }
                    }
                    node.state = BFlowNodeState.WAITING_FOR_CLIENT;
                    this.saveSession(node);
                }
                return node.state;
            }

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
                await config.onProgress();

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
                    await config.onProgress();
                    return node.state;
                }
            }

            return BFlowNodeState.FAILURE;
        }

        return BFlowNodeState.FAILURE;
    }

    private isClientActionRequired(node: BFlowNode): boolean {
        if (node.name) {
            return ['upload-file'].includes(node.name);
        }
        return false;
    }

    private hasNodeResult(node: BFlowNode) {
        if (node.id) {
            return this._outs.get(node.id);
        }
        return false;
    }

    private async getAgentForAction(action: string): Promise<AgentInfo> {
        const result = await this.request({
            subject: 'monitor-all-agents.server',
            payload: {
                query: 'get',
                data: action,
            },
        });

        if (result && result.agents && result.agents.length > 0) {
            return result.agents[0];
        }
        return null;
    }

    private async loadAgentGUI(agent: AgentInfo) {
        const result = await this.request({
            subject: `${agent.name}.server`,
            payload: {
                query: 'loadGUI',
                session: this.name,
            }
        });

        return result.data;
    }

    private saveSession(node: any) {
        // const filePath = path.resolve(___dirname, '..', '_workspace/bflow_runner', `${this.name}`);
        // const dirPath = path.dirname(filePath);
        // fs.mkdirSync(dirPath, { recursive: true });
        // fs.writeFileSync(filePath, JSON.stringify({
        //     bflow: this._bflow,
        //     outs: Object.fromEntries(this._outs)
        // }));
        this._waitingClientActionNodeId = node.id;
    }
}