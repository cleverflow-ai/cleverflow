import { Agent } from "./Agent.js";

export type GUIAgentInPayload = {
    id: string;
}

export type GUIAgentOutPayload = {
    jsonForm: Object;
}

export class GUIAgent extends Agent<GUIAgentInPayload, GUIAgentOutPayload> {

    constructor(name: string) {
        super({
            name,
            description: 'Providing JSON Schema Form Element'
        });
    }

    public async process(payload: GUIAgentInPayload): Promise<GUIAgentOutPayload> {
        return this.getGUI(payload);
    }

    public async getGUI(_payload: GUIAgentInPayload): Promise<GUIAgentOutPayload> {
        throw new Error('Method not implemented.');
    }
}