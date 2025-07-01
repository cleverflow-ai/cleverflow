export class Base64Content {
    base64Content: string;
    mimeType: string

    constructor(base64Content: string, mimeType: string) {
        this.base64Content = base64Content;
        this.mimeType = mimeType;
    }
}