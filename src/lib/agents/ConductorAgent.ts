import type { Task, TaskSendParams } from "@cleverflow-ai/cleverflow.agents/schema";
import { A2AClient } from "@cleverflow-ai/cleverflow.agents/client";

export class ConductorAgent {

    private client: A2AClient;

    constructor(serverUrl: string) {
        this.client = new A2AClient(serverUrl);
    }

    public async sendTask(taskParams: TaskSendParams, onEvent: (event: Task) => void): Promise<void> {
        const stream = this.client.sendTaskSubscribe(taskParams);
        for await (const event of stream) {
            onEvent(event as Task);
        }
    }

    public async ping(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const taskParams: TaskSendParams = {
                    id: crypto.randomUUID(),
                    message: {
                        role: "user",
                        parts: [],
                    },
                    metadata: {
                        taskName: "ping",
                    },
                };
                await this.sendTask(taskParams, (event: Task) => {
                    const state = event.status?.state;
                    if (state === 'completed') {
                        resolve(true);
                    }
                });
                reject(new Error("Ping task was not completed successfully."));
            } catch (exception) {
                console.error("Error sending ping task:", exception);
                reject(exception);
            }
        });
    }
}
