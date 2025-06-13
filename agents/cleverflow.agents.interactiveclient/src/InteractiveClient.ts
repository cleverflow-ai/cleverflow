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
        this.callbacks.set(taskParams.id, onEvent);
        const stream = this.client.sendTaskSubscribe(taskParams);

        for await (const event of stream) {
            await this.handleEvent(event as Task);
        }
    }

    private async handleEvent(event: Task) {
        console.log(`>>>>> handleEvent:`);
        console.log(event);
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

        const textData = inputRequiredEvent.status?.message?.parts?.find(
            (part) => part.type === "text",
        );

        const serverMessage = textData ? textData.text : '';

        const inputSchema = partData?.data?.inputSchema;

        if (!inputSchema) {
            return;
        }

        const [dataId, sessionId] = inputRequiredEvent.id.split('|');
        const taskParams: TaskSendParams = {
            id: `${dataId}|${sessionId}|generate-json-form`,
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
                        serverMessage,
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

    protected destroy = () => {
        this.dynamicFormSubmitSubscription?.unsubscribe();
        this.dynamicFormSubmitSubscription = null;
    }
}
