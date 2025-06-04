import { A2AClient } from "@cleverflow-ai/cleverflow.agents/client";
import type {
    DataPart,
    Part,
    Task,
    TaskSendParams,
} from "@cleverflow-ai/cleverflow.agents/schema";
import _ from 'lodash';

export abstract class InteractiveClient {
    private client: A2AClient;

    public callbacks = new Map<string, (task: Task) => void>();

    private channel = window ? window.postal?.channel("dynamic-form-channel") : null;
    private dynamicFormSubmitSubscription: any;

    constructor(serverUrl: string) {
        this.client = new A2AClient(serverUrl);
        this.dynamicFormSubmitSubscription = this.channel?.subscribe(
            "dynamic-form-submit", this.onDynamicFormSubmit
        );
    }

    public async sendTask(taskParams: TaskSendParams, onComplete: (event: Task) => void): Promise<void> {
        try {
            this.callbacks.set(taskParams.id, onComplete);
            const stream = this.client.sendTaskSubscribe(taskParams);

            for await (const event of stream) {
                await this.handleEvent(event as Task);
            }
        } catch (error: any) {
            this.handleError(error);
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

    private async handleEvent(event: Task) {

        this.onEvent(event);

        const state = event.status?.state;
        if (state === 'input-required') {
            await this.requestShowDynamicForm(event);
        } else if (state === 'completed') {
            const onComplete = this.callbacks.get(event.id);
            this.callbacks.delete(event.id);
            if (onComplete) {
                onComplete(event);
            }
        }
    }

    private requestShowDynamicForm = async (event: Task): Promise<void> => {
        const partData = event.status?.message?.parts?.find(
            (part) => part.type === "data",
        );

        const inputSchema = partData?.data?.inputSchema;

        if (!inputSchema) {
            return;
        }

        const taskParams: TaskSendParams = {
            id: crypto.randomUUID(),
            message: {
                role: "user",
                parts: [
                    {
                        type: "data",
                        data: {
                            inputSchema,
                        },
                    },
                ],
            },
            metadata: {
                taskName: "schema-to-json-form",
            },
        };
        await this.sendTask(taskParams, (event: Task) => {
            const state = event.status?.state;
            console.log(`>>> waiting for json form: state: ${state}`);
            if (state === "completed") {
                const partData = event.status?.message?.parts?.find(
                    (part) => part.type === "data",
                );
                const jsonForm = partData?.data?.jsonForm;
                if (jsonForm) {
                    return this.channel?.publish("show-dynamic-form", {
                        form: jsonForm,
                        event: event,
                    });
                }
            }
        });

    };

    private onDynamicFormSubmit = async (payload: any) => {
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
        const onComplete = this.callbacks.get(event.id);
        this.callbacks.delete(event.id);
        this.sendTask(taskParams, onComplete);
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
