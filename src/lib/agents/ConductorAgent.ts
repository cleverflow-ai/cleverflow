import type { Task, TaskSendParams } from "@cleverflow-ai/cleverflow.agents/schema";
import { A2AClient } from "@cleverflow-ai/cleverflow.agents/client";

export class ConductorAgent {

    private client: A2AClient;

    constructor(serverUrl: string) {
        this.client = new A2AClient(serverUrl);
    }

    public async sendTask(taskParams: TaskSendParams, onComplete: (event: Task) => void): Promise<void> {
        try {
            const stream = this.client.sendTaskSubscribe(taskParams);

            for await (const event of stream) {
                this.handleEvent(event as Task);
            }
        } catch (error: any) {
        }
    }

    private handleEvent(event: Task) {
        const state = event.status?.state;
        console.log(event);

    }
}
