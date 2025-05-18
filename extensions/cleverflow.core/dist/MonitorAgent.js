import _ from "lodash";
import { Agent } from "./Agent.js";
import { JSONCodec } from "nats";
/**
 * MonitorAgent class extends the Agent class to monitor and manage registered agents.
 *
 * @template InPayload - The type of the input payload.
 * @template OutPayload - The type of the output payload.
 */
class MonitorAgent extends Agent {
    _agents = [];
    _notificationSubscription;
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
    register(agent) {
        this._agents.push(agent);
    }
    /**
     * Processes the input payload and returns the output payload.
     *
     * @param payload - The input payload containing the query.
     * @returns A promise that resolves to the output payload.
     * @throws Will throw an error if the query is not supported.
     */
    async process(payload) {
        if (payload.query === 'list') {
            const publicAgents = _.filter(this._agents, (agent) => !agent.isPrivate);
            console.log(publicAgents);
            return {
                agents: _.map(publicAgents, (agent) => {
                    return {
                        name: agent.name,
                        description: agent.description,
                        instructions: 'SMELL: TODO'
                    };
                })
            };
        }
        else if (payload.query === 'register') {
            this._agents.push(payload.data);
            return {};
        }
        else if (payload.query === 'get') {
            const action = payload.data;
            const agent = _.find(this._agents, (agent) => {
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
            }
            else {
                return {};
            }
        }
        else {
            throw new Error(`${payload.query} is still not supported.`);
        }
    }
    async createNotificationSubject(config = {}) {
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
                    }
                    else {
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
