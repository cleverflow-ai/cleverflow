import * as p from "path";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function detectMimeTypeFromPath(path: string) {
    const extension = path.split('.').pop().toLowerCase();

    switch (extension) {
        case 'md':
            return 'text/markdown';
        case 'csv':
            return 'text/csv';
        case 'tsv':
            return 'text/tab-separated-values';
        case 'json':
            return 'application/json';
        case 'xml':
            return 'application/xml';
        case 'html':
        case 'htm':
            return 'text/html';
        case 'svg':
            return 'image/svg+xml';
        case 'js':
            return 'application/javascript';
        case 'css':
            return 'text/css';
        case 'yaml':
        case 'yml':
            return 'application/x-yaml';
        case 'glb':
            return 'model/gltf-binary';
        case 'txt':
            return 'text/plain';
        default:
            return 'unknown';
    }
}

export function loadWebComponentByMimeType(mimeType: string) {
    let buffer: NonSharedBuffer;
    switch (mimeType) {
        case 'application/pdf':
            buffer = fs.readFileSync(p.resolve(__dirname, '../web-components/dist-webcomponents/pdf-viewer.js'));
            return {
                tag: 'pdf-viewer',
                scriptBase64: buffer.toString('base64'),
                propBindings: [
                    {
                        componentProp: 'base64Content',
                        dataPath: 'blob',
                    }
                ]
            };
        case 'text/plain':
            buffer = fs.readFileSync(p.resolve(__dirname, '../web-components/dist-webcomponents/text-viewer.js'));
            return {
                tag: 'text-viewer',
                scriptBase64: buffer.toString('base64'),
                propBindings: [
                    {
                        componentProp: 'base64Content',
                        dataPath: 'blob',
                    }
                ]
            };
        default:
            return null;
    }

}