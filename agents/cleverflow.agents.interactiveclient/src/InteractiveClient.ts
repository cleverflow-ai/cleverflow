import { A2AClient } from "@cleverflow/cleverflow.agents";
import type {
    DataPart,
    Part,
    Task,
    TaskSendParams,
} from "@cleverflow/cleverflow.agents/schema";
import _ from 'lodash';

export abstract class InteractiveClient {
    private client: A2AClient;

    private channel = window ? window.postal?.channel("dynamic-form-channel") : null;
    private dynamicFormSubmitSubscription: any;

    constructor(serverUrl: string) {
        this.client = new A2AClient(serverUrl);
        this.dynamicFormSubmitSubscription = this.channel?.subscribe(
            "dynamic-form-submit", this.onDynamicFormSubmit
        );
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

        console.log('>>>> handle event');
        console.log(event);
        // Nếu event yêu cầu input
        if (state === 'input-required') {
            this.requestShowDynamicForm(event);
        } else {
            this.onEvent(event);
        }
    }

    private requestShowDynamicForm = (event: Task) => {
        const parts = event.status?.message?.parts;
        const jsonFormPart = _.find(parts, (part) => {
            if (part && part.type === 'data' && part.data?.jsonForm) {
                return true;
            }
            return false;
        });

        const jsonFormDataPart: DataPart = jsonFormPart as DataPart;

        if (jsonFormDataPart) {
            return this.channel?.publish("show-dynamic-form", {
                form: jsonFormDataPart.data?.jsonForm,
                event: event,
            });
        }
    };

    private onDynamicFormSubmit = async (payload: any) => {
        console.log('>>>> formSubmitHanler');
        console.log('payload', payload);
        const event: Task = payload.event;
        const metadata = event.status?.message?.metadata ?? {};
        metadata.input = payload.formData;
        const taskParams: TaskSendParams = {
            id: crypto.randomUUID(),
            message: {
                role: "user",
                parts: [],
            },
            metadata: metadata,
        };
        console.log('>>>> taskParams');
        console.log(taskParams);
        this.sendTask(taskParams);
    };

    private handleError(error: any) {
        console.error(`❌ Error:`, error.message || error);
        if (error.code) {
            console.error(`Code: ${error.code}`);
        }
        if (error.data) {
            console.error(`Data: ${JSON.stringify(error.data)}`);
        }
    }

    protected destroy = () => {
        this.dynamicFormSubmitSubscription?.unsubscribe();
        this.dynamicFormSubmitSubscription = null;
    }

    protected abstract onEvent(event: Task): void;
}
