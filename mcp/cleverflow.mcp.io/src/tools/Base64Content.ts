export class Base64Content {
    base64Content: string;
    mime: string

    constructor(base64Content: string, mime: string) {
        this.base64Content = base64Content;
        this.mime = mime;
    }
}