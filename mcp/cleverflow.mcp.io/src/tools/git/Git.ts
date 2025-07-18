import { Content } from "../Content.js";
import GitFile from "./GitFile.js";

export default abstract class Git {

    constructor(protected url: string, protected token: string) { }

    public abstract fetchFileContent(branch: string, owner: string, repo: string, path: string): Promise<Content | Array<GitFile> | null>;
    public abstract saveFileContent(branch: string, owner: string, repo: string, path: string, content: string, message: string | null): Promise<boolean>;
}