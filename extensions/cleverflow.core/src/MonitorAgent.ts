import _ from "lodash";
import { Agent } from "./Agent.js";
import { AgentInfo } from "./AgentInfo.js";
import { JSONCodec, Subscription } from "nats";

export type MonitorAgentInPayload = {
    query: 'get' | 'list' | 'logs' | 'register',
    data?: any,
}

export type MonitorAgentOutPayload = {
    agents?: AgentInfo[];
}

/**
 * MonitorAgent class extends the Agent class to monitor and manage registered agents.
 * 
 * @template InPayload - The type of the input payload.
 * @template OutPayload - The type of the output payload.
 */
class MonitorAgent extends Agent<MonitorAgentInPayload, MonitorAgentOutPayload> {
    private _agents: AgentInfo[] = [];
    private _notificationSubscription: Subscription | null | undefined;

    /**
     * Constructs a new MonitorAgent instance with a predefined name and description.
     */
    constructor() {
        super({
            name: 'monitor-all-agents',
            description: 'Monitor all available, registred Agents.'
        });
    }

    /**
     * Registers a new agent by adding it to the internal list of agents.
     * 
     * @param agent - The agent information to be registered.
     */
    public register(agent: AgentInfo) {
        this._agents.push(agent);
    }

    /**
     * Processes the input payload and returns the output payload.
     * 
     * @param payload - The input payload containing the query.
     * @returns A promise that resolves to the output payload.
     * @throws Will throw an error if the query is not supported.
     */
    public async process(payload: MonitorAgentInPayload): Promise<MonitorAgentOutPayload> {
        if (payload.query === 'list') {
            const publicAgents = _.filter(this._agents, (agent: AgentInfo) => !agent.isExternal && !agent.isPrivate);
            return {
                agents: _.map(publicAgents, (agent: AgentInfo) => {
                    return {
                        name: agent.name,
                        description: agent.description,
                        instructions: 'SMELL: TODO'
                    };
                })
            };
        } else if (payload.query === 'register') {
            this._agents.push(payload.data);
            return {};
        } else if (payload.query === 'get') {
            const action = payload.data;
            const agent = _.find(this._agents, (agent: AgentInfo) => {
                if (agent.actions && agent.actions.includes(action)) {
                    return true;
                }
                return false;
            });
            if (agent) {
                return {
                    agents: [
                        {
                            name: agent.name,
                            description: agent.description,
                            isExternal: agent.isExternal,
                            guiEnabled: agent.guiEnabled,
                        }
                    ]
                };
            } else {
                return {};
            }

        } else {
            throw new Error(`${payload.query} is still not supported.`);
        }
    }

    public async createNotificationSubject(config: Partial<{ servers?: string | string[], token?: string }> = {}): Promise<void> {

        const subject = 'monitor.agents.notifications.server';

        const defaultConfig = {
            servers: 'localhost:4222',
            token: '76de3ba222bec3af21f9dbfb01f3197b',

        };

        config = { ...defaultConfig, ...config };
        if (!this.connection) {
            this.connection = await this.connect(config);
            console.log(`Agent ${this.name} was connected.`);
        }

        if (!this._notificationSubscription) {
            this._notificationSubscription = this.connection.subscribe(`${subject}`);
            console.log(`Agent ${this.name} is now listening to ${subject}.`);

            if (this._notificationSubscription) {
                this._notificationSubscription.callback = async (err, message) => {
                    if (err) {
                        console.error(`Agent ${this.name} Error receiving message from ${subject}:`, err);
                    } else {
                        // process messages
                        const inPayload = JSONCodec().decode(message.data);
                        console.log(`[Agent ${this.name} received] from ${subject}:`);
                        console.log(JSON.stringify(inPayload));
                        _.forEach(this._agents, (agent) => {
                            if (agent.onNotify) {
                                agent.onNotify(inPayload);
                            }
                        });
                    }
                };
            }
        }
    }
}
export const monitorAgent = new MonitorAgent();