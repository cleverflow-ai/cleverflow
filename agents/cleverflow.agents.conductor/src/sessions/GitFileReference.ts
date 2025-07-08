export default class GitFileReference {
    url: string;
    token: string;
    branch: string;
    owner: string;
    repo: string;
    path: string;
    hashedFileContent: string;

    constructor(
        url: string,
        token: string,
        branch: string,
        owner: string,
        repo: string,
        path: string,
    ) {
        this.url = url;
        this.token = token;
        this.branch = branch;
        this.owner = owner;
        this.repo = repo;
        this.path = path;
    }

    setHashedFileContent(value: string) {
        this.hashedFileContent = value;
    }
}