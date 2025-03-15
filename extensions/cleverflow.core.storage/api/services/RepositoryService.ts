import FileMetadata from "../../models/FileMetadata.ts";
import axiosInstance from "../AxiosInstance.ts";

// Gets the metadata and contents (if a file) of an entry in a repository, or a list of entries if a dir
export async function getFile(config: {
    owner: string,
    repo: string,
    filePath: string,
}): Promise<FileMetadata[]> {
    const url = `/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(config.filePath)}`;
    const response = await axiosInstance.get(url);
    if (Array.isArray(response.data)) {
        return response.data;
    }
    return [response.data];
}

export async function createFile(config: {
    owner: string,
    repo: string,
    filePath: string,
    fileContent: string,
    message?: string,
}) {
    const url = `/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(config.filePath)}`;
    const response = await axiosInstance.post(url, {
        "content": Buffer.from(config.fileContent).toString("base64"),
        "message": config.message,
    });
    return response.status === 201;
}

export async function updateFile(config: {
    owner: string,
    repo: string,
    filePath: string,
    fileContent: string,
    sha: string,
    message?: string,
}) {
    const url = `/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(config.filePath)}`;
    const response = await axiosInstance.put(url, {
        "content": Buffer.from(config.fileContent).toString("base64"),
        "sha": config.sha,
        "message": config.message,
    });
    return response.status === 200;
}

export async function deleteFile(config: {
    owner: string,
    repo: string,
    filePath: string,
    sha: string,
    message?: string,
}) {
    const url = `/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(config.filePath)}`;
    const response = await axiosInstance.put(url, {
        "sha": config.sha,
        "message": config.message,
    });
    return response.status === 200;
}