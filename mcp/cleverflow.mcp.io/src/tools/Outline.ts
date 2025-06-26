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
        console.log(">>>> Outline fetch result:");
        const result = await response.json();
        console.log("Outline fetch result:", result);
        return result?.data?.text ?? "";
    }
}
