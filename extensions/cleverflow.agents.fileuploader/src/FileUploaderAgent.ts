import { Agent } from "@cleverflow/cleverflow.core";
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
// import { inflateSync } from 'zlib';
import { v4 as uuidv4 } from 'uuid';

// Get the equivalent of __dirname in ESM
const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(___filename);

export type InPayload = {
    query: 'loadGUI' | 'upload',
    name?: string,
    session?: string,
    data?: any
}


export type OutPayload = {
    data?: any,
}

export default class FileUploaderAgent extends Agent<InPayload, OutPayload> {

    constructor() {
        super({
            name: 'file-up',
            description: 'This Agent facilitates file uploads by requesting files from the client and saving them to its designated workspace.'
        });
    }

    public async process(payload: InPayload): Promise<OutPayload> {
        if (payload.query === 'loadGUI') {
            return {
                data: {
                    webcomponent: 'file-uploader',
                    attributes: {
                        servers: "ws://localhost:8080",
                        token: "76de3ba222bec3af21f9dbfb01f3197b",
                        session: payload.session,
                    },
                    buffer: this.loadGUIBinary(),
                },
            };
        } else if (payload.query === 'upload') {

            const filePath = path.resolve(___dirname, '..', '_workspace/upload', `${uuidv4()}_${payload.name}`);
            const dirPath = path.dirname(filePath);
            fs.mkdirSync(dirPath, { recursive: true });

            // Convert compressed data array back to Uint8Array
            const compressedData = new Uint8Array(payload.data);

            // // Decompress the data
            // const decompressedData = inflateSync(compressedData);
            fs.writeFileSync(filePath, compressedData);

            this.notify('monitor.agents.notifications.server', {
                agentName: this.name,
                action: 'processed',
                session: payload.session,
                time: new Date(),
                data: {
                    filePath
                }
            }, {});

            return {};
        } else {
            throw new Error(`${payload.query} is still not supported.`);
        }
    }

    public async register() {
        await this.request({
            subject: 'monitor-all-agents.server',
            payload: {
                query: 'register',
                data: {
                    name: 'file-up',
                    description: 'This Agent facilitates file uploads by requesting files from the client and saving them to its designated workspace.',
                    isExternal: true,
                    actions: ['upload-file'],
                    guiEnabled: true,
                }
            }
        });
    }

    private loadGUIBinary(): Buffer {
        const binaryData = fs.readFileSync(path.resolve(___dirname, '..', 'gui/dist-webcomponents/file-uploader.js'));
        return binaryData;
    }
}