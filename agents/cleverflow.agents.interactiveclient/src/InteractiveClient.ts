import { A2AClient } from "@cleverflow-ai/cleverflow.agents/client";
import type {
    DataPart,
    Part,
    Task,
    TaskSendParams,
    TaskState,
} from "@cleverflow-ai/cleverflow.agents/schema";
import _ from 'lodash';

export class InteractiveClient {
    private client: A2AClient;

    public callbacks = new Map<string, (state: TaskState, task: Task) => void>();

    private channel = window ? window.postal?.channel("dynamic-form-channel") : null;
    private dynamicFormSubmitSubscription: any;

    constructor(serverUrl: string) {
        this.client = new A2AClient(serverUrl);
        this.dynamicFormSubmitSubscription = this.channel?.subscribe(
            "dynamic-form-submit", this.onDynamicFormSubmit
        );
    }

    public async sendTask(taskParams: TaskSendParams, onEvent: (state: TaskState, event: Task) => void): Promise<void> {
        try {

            this.callbacks.set(taskParams.id, onEvent);
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
                    id: 'unknown|unknown|ping',
                    message: {
                        role: "user",
                        parts: [],
                    },
                };
                await this.sendTask(taskParams, (state: TaskState, event: Task) => {
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
        const state = event.status?.state;
        if (state === 'input-required') {
            await this.requestShowDynamicForm(event);
        } else {
            const onEvent = this.callbacks.get(event.id);
            if (onEvent) {
                onEvent(state, event);
            }
        }
    }

    private requestShowDynamicForm = async (inputRequiredEvent: Task): Promise<void> => {
        const partData = inputRequiredEvent.status?.message?.parts?.find(
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
        await this.sendTask(taskParams, (state: TaskState, event: Task) => {
            console.log(`>>> waiting for json form: state: ${state}`);
            if (state === "completed") {
                const partData = event.status?.message?.parts?.find(
                    (part) => part.type === "data",
                );
                const jsonForm = partData?.data?.jsonForm;
                if (jsonForm) {
                    return this.channel?.publish("show-dynamic-form", {
                        form: jsonForm,
                        event: inputRequiredEvent,
                    });
                }
            }
        });

    };

    private onDynamicFormSubmit = async (payload: any) => {
        const event: Task = payload.event;
        const partData = event.status?.message?.parts?.find(
            (part) => part.type === "data",
        );

        const userInput = partData?.data?.userInput ?? {};
        const node: any = partData?.data?.node ?? { id: "unknown" };

        userInput[node.id] = payload.formData;
        const taskParams: TaskSendParams = {
            id: event.id,
            message: {
                role: "user",
                parts: [{
                    type: "data",
                    data: {
                        userInput,
                    },
                }],
            },
        };

        const onEvent = this.callbacks.get(event.id);
        this.callbacks.delete(event.id);
        this.sendTask(taskParams, onEvent);
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
}
