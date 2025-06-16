import type { FileNode } from "../lib/filemanager/FileNode.js";

export class GiteaService {
    baseUrl: string;
    apiKey: string;
    repoOwner: string;
    repoName: string;
    branch: string;

    constructor(baseUrl: string, apiKey: string, repoOwner: string, repoName: string, branch: string = "main") {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.branch = branch;
    }

    private async fetchApi(path: string) {
        const url = `${this.baseUrl}/api/v1/repos/${this.repoOwner}/${this.repoName}/contents/${path}?ref=${this.branch}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        return await res.json();
    }

    async fetchFolderChildren(path: string): Promise<FileNode[]> {
        const items = await this.fetchApi(path);
        if (!Array.isArray(items)) return [];

        return items.map((item: any): FileNode => ({
            id: item.sha,
            name: item.name,
            path: item.path,
            type: item.type === "dir" ? "folder" : "file",
        }));
    }

    async fetchFileContent(path: string): Promise<string> {
        const item = await this.fetchApi(path);

        if (item.encoding === "base64" && item.content) {
            return atob(item.content);
        }

        if (item.download_url) {
            const res = await fetch(item.download_url);
            return await res.text();
        }

        throw new Error("Unable to fetch file content");
    }
}
