import { createInbox } from 'nats';
import Agent from "../common/Agent.js";


export type InPayload = {
}

export type OutPayload = {
}

export default class FileUploaderAgent extends Agent<InPayload, OutPayload> {

    constructor(config?: { name?: string }) {
        super({
            name: config?.name ?? 'file-uploader',
            description: 'This Agent facilitates file uploads by requesting files from the client and saving them to its designated workspace.'
        });

        this.publish({
            message: 'please give me a file.'
        });
        setInterval(() => {
            this.publish({
                message: 'please give me a file.'
            });
        }, 30 * 1000);
    }

    public async process(payload: InPayload): Promise<OutPayload> {
        return {};
    }
}