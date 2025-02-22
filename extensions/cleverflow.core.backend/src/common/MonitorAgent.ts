import _ from "lodash";
import Agent from "./Agent.js";
import AgentInfo from "./AgentInfo.js";

export type InPayload = {
    query: 'list' | 'logs' 
}

export type OutPayload = {
    agents: AgentInfo[];
}

/**
 * MonitorAgent class extends the Agent class to monitor and manage registered agents.
 * 
 * @template InPayload - The type of the input payload.
 * @template OutPayload - The type of the output payload.
 */
export default class MonitorAgent extends Agent<InPayload, OutPayload> {
    private _agents: AgentInfo[] = [];

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
    public async process(payload: InPayload): Promise<OutPayload> {
        if (payload.query === 'list') {
            // SMELL: 
            // return { agents: this._agents };
            return { 
                agents: _.map(this._agents, (agent: AgentInfo) => {
                    return {
                        name: agent.name,
                        description: agent.description,
                        instructions: 'SMELL: TODO'
                    };
                })
            };
        } else {
            throw new Error(`${payload.query} is still not supported.`);
        }
    }
}