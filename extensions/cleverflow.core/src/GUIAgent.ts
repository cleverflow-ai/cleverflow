import { Agent } from "./Agent.js";

export type GUIAgentInPayload = {
    id: string;
}

export type GUIAgentOutPayload = {
    jsonForm: Object;
}

export abstract class GUIAgent extends Agent<GUIAgentInPayload, GUIAgentOutPayload> {

    constructor(name: string) {
        super({
            name,
            description: 'Providing JSON Schema Form Element'
        });
    }

    public async process(payload: GUIAgentInPayload): Promise<GUIAgentOutPayload> {
        return this.getGUI(payload);
    }

    public abstract getGUI(payload: GUIAgentInPayload): Promise<GUIAgentOutPayload>;
}