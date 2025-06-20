export default class Gitea {
    constructor(private url: string, private token: string) {
    }

    public async fetchFileContent(branch: string, owner: string, repo: string, path: string): Promise<string | Array<any> | null> {

        const result = await this.fetchFile(branch, owner, repo, path);

        if (Array.isArray(result)) {
            return result;
        } else if (result.content) {
            return Buffer.from(result.content, "base64").toString("utf-8");
        }
        return null;
    }

    public async updateFileContent(branch: string, owner: string, repo: string, path: string, content: string): Promise<boolean> {

        const currentFile = await this.fetchFile(branch, owner, repo, path);
        if (currentFile == null) {
            throw new Error('File was not found');
        }

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
                sha: currentFile.sha, // nếu đang update file qua GitHub API
            }),
        });

        return response.ok;
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
            throw new Error(`Failed to fetch gitea file content: ${response.statusText}`);
        }
        return await response.json();
    }
}
