import axios from "axios";

export async function getOutlineFileContent({
    url,
    apiKey,
    fileId,
}: {
    url: string;
    apiKey: string;
    fileId: string;
}): Promise<string> {
    const response = await axios.post(url, {
        id: fileId
    }, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });
    return response.data;
}
