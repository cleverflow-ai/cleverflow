import axiosInstance from "../AxiosInstance.ts";

export async function createFile(config: {
    owner: string,
    repo: string,
    filePath: string,
    fileContent: string,
    message?: string,
}) {
    const url = `/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(config.filePath)}`;
    console.log(`>>> url: ${url}`);
    const response = await axiosInstance.post(url, {
        "content": Buffer.from(config.fileContent).toString("base64"),
        "message": config.message,
    });
    return response.status === 201;
}