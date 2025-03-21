import { Agent } from "@cleverflow/cleverflow.core";
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { inflateSync } from 'zlib';
import { v4 as uuidv4 } from 'uuid';

// Get the equivalent of __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);

export type InPayload = {
    action: 'loadGUI' | 'upload',
    name?: string,
    data?: any
}


export type OutPayload = {
    data?: any,
}

export default class FileUploaderAgent extends Agent<InPayload, OutPayload> {

    constructor() {
        super({
            name: 'file-uploader',
            description: 'This Agent facilitates file uploads by requesting files from the client and saving them to its designated workspace.'
        });
    }

    public async process(payload: InPayload): Promise<OutPayload> {
        if (payload.action === 'loadGUI') {
            return {
                data: this.loadGUIBinary()
            };
        } else if (payload.action === 'upload') {

            const filePath = path.resolve(___dirname, '..', '_workspace/upload', `${uuidv4()}_${payload.name}`);
            const dirPath = path.dirname(filePath);
            fs.mkdirSync(dirPath, { recursive: true });

            // Convert compressed data array back to Uint8Array
            const compressedData = new Uint8Array(payload.data);

            // Decompress the data
            const decompressedData = inflateSync(compressedData);
            fs.writeFileSync(filePath, decompressedData);

            return {};
        } else {
            throw new Error(`${payload.action} is still not supported.`);
        }
    }

    private loadGUIBinary(): Buffer {
        const binaryData = fs.readFileSync(path.resolve(___dirname, '..', 'gui/dist-webcomponents/file-uploader.js'));
        return binaryData;
    }
}