import { A2AClient } from "@cleverflow/cleverflow.agents";

import type {
    Task,
    TaskSendParams,
} from "@cleverflow/cleverflow.agents/schema";

export abstract class InteractiveClient {
    private client: A2AClient;

    constructor(serverUrl: string) {
        this.client = new A2AClient(serverUrl);
    }

    public async sendTask(taskParams: TaskSendParams): Promise<void> {
        try {
            const stream = this.client.sendTaskSubscribe(taskParams);

            for await (const event of stream) {
                this.handleEvent(event as Task);
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleEvent(event: Task) {
        const state = event.status?.state;

        // Nếu event yêu cầu input
        if (state === 'input-required') {
            const formSchema = this.extractJsonForm(event);

            if (!formSchema) {
                console.warn('No JSON form found in event input');
                return;
            }

            // Gọi hàm callback để lấy input từ người dùng (hoặc UI)
            const inputs = await this.inputHandler(event, formSchema);

            // Gửi input ngược lại cho server
            // await this.submitInput(task.id, inputs);

            return;
        } else {
            this.onEvent(task);
        }
    }

    private extractJsonForm(event: Task): any | null {
        const parts = event.status?.message?.parts || [];
        for (const part of parts) {
            if (part.type === 'data' && part.data?.jsonForm) {
                return part.data.jsonForm;
            }
        }
        return null;
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

    protected abstract onEvent(event: unknown): void;
    protected abstract submitInput(task: Task, inputs: Record<string, any>): Promise<void>;
}
