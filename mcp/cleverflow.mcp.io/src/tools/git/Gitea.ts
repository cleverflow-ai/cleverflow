
import { fileTypeFromBuffer } from 'file-type';
import { detectMimeTypeFromPath } from '../../common/Util.js';
import { Content, ContentEncoding } from '../Content.js';
import Git from './Git.js';
import GitFile from './GitFile.js';

export default class Gitea extends Git {

    constructor(url: string, token: string) {
        super(url, token);
    }

    public async fetchFileContent(branch: string, owner: string, repo: string, path: string): Promise<Content | Array<GitFile> | null> {
        try {
            if (path.startsWith('/')) {
                path = path.slice(1);
            }
            const result = await this.fetchFile(branch, owner, repo, path);

            if (!result) {
                return null;
            }

            if (Array.isArray(result)) {
                return result;
            } else if (result.content) {
                const buffer = Buffer.from(result.content, ContentEncoding.Base64);

                const type = await fileTypeFromBuffer(buffer);
                let mimeType = type?.mime;
                if (!mimeType) {
                    mimeType = detectMimeTypeFromPath(path);
                }
                return new Content(result.content, mimeType, ContentEncoding.Base64);
            } else if (result.size > 0 && result.download_url) {
                // large file: size > 0 and content is empty.
                const largeBase64String = await this.fetchFileFromUrl(result.download_url);
                if (largeBase64String) {
                    result.content = largeBase64String;
                }
                return new Content(result.content, detectMimeTypeFromPath(result.download_url), ContentEncoding.Base64);
            }
        } catch (exception) {
            console.log(exception);
        }

        return null;
    }

    public async saveFileContent(branch: string, owner: string, repo: string, path: string, content: string): Promise<boolean> {
        if (path.startsWith('/')) {
            path = path.slice(1);
        }
        const currentFile = await this.fetchFile(branch, owner, repo, path);
        if (currentFile == null) {
            let url = `${this.url}/repos/${owner}/${repo}/contents/${path}?token=${this.token}`;
            if (branch) {
                url += `&ref=${branch}`;
            }
            const base64Content = Buffer.from(content, "utf-8").toString("base64");

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: base64Content,
                    message: `Not given`,
                }),
            });
            return response.ok;
        } else {
            let url = `${this.url}/repos/${owner}/${repo}/contents/${path}?token=${this.token}`;
            if (branch) {
                url += `&ref=${branch}`;
            }
            const base64Content = Buffer.from(content, "utf-8").toString("base64");

            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: base64Content,
                    message: `Not given`,
                    sha: currentFile.sha,
                }),
            });
            return response.ok;
        }
    }

    private async fetchFile(branch: string, owner: string, repo: string, path: string): Promise<any> {

        let url = `${this.url}/repos/${owner}/${repo}/contents/${path}?token=${this.token}`;
        if (branch) {
            url += `&ref=${branch}`;
        }
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.log(response);
            return null;
        }
        return await response.json();
    }

    private async fetchFileFromUrl(url: string): Promise<string | null> {
        const response = await fetch(`${url}?token=${this.token}`, {
            method: "GET"
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Fetch failed:", response.status, errorText);
            return null;
        }

        const buffer = Buffer.from(await response.arrayBuffer());

        return buffer.toString("base64");
    }

}
