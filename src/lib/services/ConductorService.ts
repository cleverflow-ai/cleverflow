import type { Task, TaskSendParams, TaskState, TextPart } from "@cleverflow-ai/cleverflow.agents/schema";
import type Session from "$lib/session/Session.svelte";
import md5 from "md5";
import { ConductorClient } from "./ConductorClient.js";

export default class ConductorService {

    private conductorServerUrl: string;
    private conductorClient: ConductorClient;

    constructor(conductorServerUrl: string) {
        this.conductorServerUrl = conductorServerUrl;
        this.conductorClient = new ConductorClient(this.conductorServerUrl);
    }

    async getFileContents(session: Session): Promise<Task | null> {

        try {
            const workspaceId = session.repo;
            const dataId = md5(session.path);
            const instanceId = session.hashedFileContent;
            const sessionId = session.id;

            return new Promise((resolve) => {
                const taskParams: TaskSendParams = {
                    id: `${workspaceId}|${dataId}|${instanceId}|${sessionId}|get-file-contents`,
                    sessionId: sessionId,
                    message: {
                        role: "user",
                        parts: [],
                        metadata: {
                            session: session.toJson(),
                        },
                    },
                };
                this.conductorClient?.sendTask(taskParams, (state: TaskState, event: Task) => {

                    if (state === 'completed') {
                        resolve(event);
                    } else if (state === 'failed') {
                        resolve(null);
                    } else if (state === 'working') {
                        console.log(event);
                    } else {
                        resolve(null);
                    }
                });
            })

        } catch (exception: any) {
            console.error(exception);
            return null;
        }
    }

    async saveFileContents(session: Session, fileContent: string,): Promise<boolean> {

        try {
            const workspaceId = session.repo;
            const dataId = md5(session.path);
            const instanceId = session.hashedFileContent;
            const sessionId = session.id;

            return new Promise((resolve) => {
                const taskParams: TaskSendParams = {
                    id: `${workspaceId}|${dataId}|${instanceId}|${sessionId}|save-file-content`,
                    sessionId: sessionId,
                    message: {
                        role: "user",
                        parts: [{
                            type: 'text',
                            text: fileContent
                        }],
                        metadata: {
                            session: session.toJson(),
                        },
                    },
                };
                this.conductorClient?.sendTask(taskParams, (state: TaskState, event: Task) => {
                    if (state === 'completed') {
                        resolve(true);
                    } else if (state === 'failed') {
                        resolve(false);
                    } else if (state === 'working') {
                        console.log(event);
                    } else {
                        resolve(false);
                    }
                });
            })

        } catch (exception: any) {
            console.error(exception);
            return false;
        }
    }

    async generateBFlow(
        session: Session,
        text: string,
        onProgress: (state: string) => void,
        onCompleted: (result: any) => void,
        onFailed: (error: Error) => void,
    ): Promise<void> {

        const workspaceId = session.repo;
        const dataId = md5(session.path);
        const instanceId = session.hashedFileContent;
        const sessionId = session.id;

        return new Promise((resolve) => {
            const taskParams: TaskSendParams = {
                id: `${workspaceId}|${dataId}|${instanceId}|${sessionId}|generate-bflow`,
                sessionId: sessionId,
                message: {
                    role: "user",
                    parts: [{
                        type: 'text',
                        text: text ?? ''
                    }],
                    metadata: {
                        session: session.toJson(),
                    },
                },
            };
            this.conductorClient?.sendTask(taskParams, (state: TaskState, event: Task) => {
                console.log(`>>> state: ${state}`);
                if (state === 'completed') {
                    const bflow = event.status?.message?.parts?.[0]?.data?.bflow;
                    const bflowviz = event.status?.message?.parts?.[0]?.data?.bflowviz;
                    onCompleted({
                        bflow,
                        bflowviz,
                    });
                    resolve();
                } else if (state === 'failed') {
                    onFailed(new Error("Failed to convert text to BFlow"));
                    resolve();
                } else if (state === 'working') {
                    const text = event.status?.message?.parts?.[0]?.text;
                    onProgress(text);
                } else {
                    onFailed(new Error(`Unexpected state: ${state}`));
                    resolve();
                }
            });
        })
    }

    async runBFlow(
        session: Session,
        bflow: any,
        onProgress: (data: any) => void,
        onCompleted: (data: any) => void,
        onFailed: (error: Error) => void
    ): Promise<void> {

        try {
            const workspaceId = session.repo;
            const dataId = md5(session.path);
            const instanceId = session.hashedFileContent;
            const sessionId = session.id;

            const taskParams: TaskSendParams = {
                id: `${workspaceId}|${dataId}|${instanceId}|${sessionId}|run-bflow`,
                sessionId: sessionId,
                message: {
                    role: "user",
                    parts: [{
                        type: "data",
                        data: {
                            bflow: bflow,
                        },
                    }],
                    metadata: {
                        session: session.toJson(),
                    },
                },
            };
            this.conductorClient?.sendTask(taskParams, (state: TaskState, event: Task) => {
                if (['working', 'completed'].includes(state)) {
                    let dataPart = event.status?.message?.parts?.find((part) => {
                        return part.type === 'data' && part.data;
                    });
                    const bflow = dataPart?.data?.bflow;
                    const outs = dataPart?.data?.outs;

                    if (state === 'completed') {
                        onCompleted({ bflow, outs });
                    } else {
                        onProgress({ bflow, outs });
                    }
                } else if (state === 'failed') {
                    onFailed(new Error("Failed to run BFlow"));
                } else {
                    onFailed(new Error("Unexpected state while running BFlow"));
                }
            });
        } catch (e: any) {
            onFailed(new Error(e.message ?? "Unexpected state while running BFlow"));
        }
    }
}