
export enum ContentEncoding {
    Utf8 = 'utf8',
    Base64 = 'base64',
    ByteArray = 'byte-array'
}

export class Content {
    data: string | number[];
    encoding: ContentEncoding;
    mimeType: string

    constructor(data: string | number[], mimeType: string, encoding: ContentEncoding) {
        this.data = data;
        this.mimeType = mimeType;
        this.encoding = encoding;
    }
}