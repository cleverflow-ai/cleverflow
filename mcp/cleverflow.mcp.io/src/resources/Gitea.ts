export default class Outline {
    constructor(private baseUrl: string, private apiKey: string) {
    }

    public async fetch(repoOwner: string, repo: string, filePath: string): Promise<string> {
        const url = `${this.baseUrl}/repos/${repoOwner}/${repo}/contents/${filePath}?token=${this.apiKey}`;
        console.log(url);
        console.log(this.apiKey);
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch outline file content: ${response.statusText}`);
        }
        const result = await response.json();
        if (result.content) {
            return Buffer.from(result.content, "base64").toString("utf-8");
        }
        return null;
    }
}
