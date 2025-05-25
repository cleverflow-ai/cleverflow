export default class Outline {
    constructor(private baseUrl: string, private apiKey: string) {
    }

    public async fetch(fileId: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/documents.info`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: fileId }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch outline file content: ${response.statusText}`);
        }

        const result = await response.json();
        return result?.data?.text ?? "";
    }
}
