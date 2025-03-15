import type { FileMetadataType } from "./FileMetadataType";

export default class FileMetadata {
    name: string;
    path: string;
    sha: string;
    last_commit_sha: string;
    type: FileMetadataType;
    size: number;
    encoding?: string;
    content?: string; // base64 encoded
    target?: any;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;


    static getContent(fileMetadata: FileMetadata): string {
        return Buffer.from(fileMetadata.content ?? '', "base64").toString("utf-8");
    }
}