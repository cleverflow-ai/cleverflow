import type { Task, TaskSendParams } from "@cleverflow-ai/cleverflow.agents/schema";
import { InteractiveClient } from "@cleverflow-ai/cleverflow.agents.interactiveclient";

export class ConductorAgent extends InteractiveClient {

    constructor(serverUrl: string) {
        super(serverUrl);
    }

    protected onEvent(event: Task): void {
        console.log(event);
    }
}
