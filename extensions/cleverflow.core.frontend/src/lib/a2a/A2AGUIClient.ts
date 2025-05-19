import { A2AClient } from "@cleverflow/cleverflow.a2a";

import type {
    TaskSendParams,
} from "@cleverflow/cleverflow.a2a/schema";

export class A2AConductorClient {
    private client: A2AClient;

    constructor(private serverUrl: string) {
        this.client = new A2AClient(serverUrl);
    }

    public async sendTask(payload: any): Promise<void> {
        try {

            const taskParams: TaskSendParams = {
                id: crypto.randomUUID(),
                name: 'read-file',
                message: {
                    role: "user",
                    parts: [{ type: "text", text: 'hello server: ' + new Date().toISOString() }]
                }

            };

            console.log(taskParams);

            const stream = this.client.sendTaskSubscribe(taskParams);

            for await (const event of stream) {
                this.handleEvent(event);
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleEvent(event: unknown) {
        console.log(`📥 Received event:`, event);
    }

    private handleError(error: any) {
        console.error(`❌ Error:`, error.message || error);
        if (error.code) {
            console.error(`Code: ${error.code}`);
        }
        if (error.data) {
            console.error(`Data: ${JSON.stringify(error.data)}`);
        }
    }
}
