var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import _ from "lodash";
import { Agent } from "./Agent.js";
/**
 * MonitorAgent class extends the Agent class to monitor and manage registered agents.
 *
 * @template InPayload - The type of the input payload.
 * @template OutPayload - The type of the output payload.
 */
class MonitorAgent extends Agent {
    /**
     * Constructs a new MonitorAgent instance with a predefined name and description.
     */
    constructor() {
        super({
            name: 'monitor-all-agents',
            description: 'Monitor all available, registred Agents.'
        });
        this._agents = [];
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
    process(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (payload.query === 'list') {
                // SMELL: 
                // return { agents: this._agents };
                return {
                    agents: _.map(this._agents, (agent) => {
                        return {
                            name: agent.name,
                            description: agent.description,
                            instructions: 'SMELL: TODO'
                        };
                    })
                };
            }
            else {
                throw new Error(`${payload.query} is still not supported.`);
            }
        });
    }
}
export const monitorAgent = new MonitorAgent();
