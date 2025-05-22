import { InteractiveClient } from "@cleverflow/cleverflow.agents.interactiveclient";
import type { Task } from "@cleverflow/cleverflow.agents/schema";

export class ConductorAgent extends InteractiveClient {

    constructor(serverUrl: string) {
        super(serverUrl);
    }

    protected onEvent(event: Task): void {
        console.log('>>>> event');
        console.log(event);
    }
}
