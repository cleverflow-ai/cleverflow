import { InteractiveClient } from "@cleverflow-ai/cleverflow.agents.interactiveclient";
import type { Task, TaskSendParams } from "@cleverflow-ai/cleverflow.agents/schema";

export class ConductorAgent extends InteractiveClient {

    constructor(serverUrl: string) {
        super(serverUrl);
    }

    protected onEvent(event: Task): void {
        console.log('>>>> event');
        console.log(event);
        const state = event.status?.state;
        if (state === 'completed') {
            const onComplete = this.callbacks.get(event.id);
            if (onComplete) {
                onComplete(event);
            }
        }
    }
}
