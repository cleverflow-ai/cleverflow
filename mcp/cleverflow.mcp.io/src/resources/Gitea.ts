export default class Outline {
    constructor(private baseUrl: string, private apiKey: string) {
    }

    public async fetch(branch: string, owner: string, repo: string, path: string): Promise<string | Array<any> | null> {
        let url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}?token=${this.apiKey}`;
        if (branch) {
            url += `&ref=${branch}`;
        }
        console.log(url);
        console.log(this.apiKey);
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log(response.ok);
        if (!response.ok) {
            throw new Error(`Failed to fetch gitea file content: ${response.statusText}`);
        }
        const result = await response.json();
        console.log(result);
        if (Array.isArray(result)) {
            return result;
        } else if (result.content) {
            return Buffer.from(result.content, "base64").toString("utf-8");
        }
        return null;
    }
}
