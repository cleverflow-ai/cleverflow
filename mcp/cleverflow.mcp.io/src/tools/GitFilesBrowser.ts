import Git from "./git/Git.js";
import Gitea from "./git/Gitea.js";
import GitFile from "./git/GitFile.js";
import Github from "./git/Github.js";
import _ from "lodash";
import * as path from 'path';

class Part {
    name: string;
    isParam: boolean;
    isFileFilter: boolean;
}

class FileNode {
    part: Part;
    type: "dir" | "file" = "dir";
    path: string;
    level: number;
    children: FileNode[] | null;
    parent: FileNode | null;

    constructor({
        part,
        path,
        level = 0,
        type = "dir",
        children = null,
        parent = null,
    }: {
        part: Part;
        path: string;
        level?: number;
        type?: "dir" | "file";
        children?: FileNode[] | null;
        parent?: FileNode | null;
    }) {
        this.part = part;
        this.path = path;
        this.level = level;
        this.type = type;
        this.children = children;
        this.parent = parent;
    }
}

export default class GitFilesBrowser {

    url: string;
    token: string;
    branch: string;
    owner: string;
    repo: string;

    constructor(url: string, token: string, branch: string, owner: string, repo: string,) {
        this.url = url;
        this.token = token;
        this.branch = branch;
        this.owner = owner;
        this.repo = repo;
    }

    async run(pattern: string): Promise<string[]> {

        const parts = [];

        const segments = pattern.split('/');
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const isLastSegment = i === segments.length - 1;

            const part = new Part();
            part.name = segment;

            if (!isLastSegment) {
                part.isFileFilter = false;
                part.name = segment;
                part.isParam = segment === '*' || (segment.startsWith('{') && segment.endsWith('}'));
            } else {
                part.isFileFilter = segment.includes(".");
                part.name = segment;
            }

            parts.push(part);
        }


        if (!parts || parts.length === 0) {
            return [];
        }

        const firstPart = parts[0];
        const root = new FileNode({
            part: firstPart,
            path: firstPart.name ?? (this.isGitHub() ? '/' : '.'),
            children: [],
            level: 0
        });

        const allFilePathes = await this.browser(root, parts, null);

        return allFilePathes;
    }

    private async browser(node: FileNode, parts: Part[], filePaths: string[] | null): Promise<string[]> {
        const result = filePaths ?? [];
        if (node.level >= parts.length) {
            return;
        }

        const part: Part | null = node.level < parts.length ? parts[node.level] : null;
        const nextPart: Part | null = node.level + 1 < parts.length ? parts[node.level + 1] : null;
        if (node.type === 'dir') {
            if (!node.part.isParam) {
                if (nextPart) {
                    node.children = [
                        new FileNode({
                            type: nextPart.isFileFilter ? 'file' : 'dir',
                            part: nextPart,
                            path: `${node.path}/${nextPart.name}`,
                            children: [],
                            level: node.level + 1,
                            parent: node,
                        })
                    ];
                    await this.browser(node.children[0], parts, result);
                }
            } else {
                // segment surrounding with {}
                const pathToBrowser = node.parent ? node.parent.path : node.path;
                const git: Git = this.url === Github.McpServerUrl ? new Github(this.url, this.token) : new Gitea(this.url, this.token);
                const gitFiles = await git.fetchFileContent(this.branch, this.owner, this.repo, pathToBrowser);
                const parent = node.parent;
                parent.children = [];
                if (Array.isArray(gitFiles)) {
                    const updatedPart = JSON.parse(JSON.stringify(part));
                    updatedPart.isParam = false;
                    _.forEach(gitFiles, (gitFile: GitFile) => {
                        if (gitFile.type === 'dir') {
                            parent.children.push(new FileNode({
                                type: 'dir',
                                part: updatedPart,
                                path: gitFile.path,
                                children: [],
                                level: parent.level + 1,
                                parent: parent,
                            }));
                        }
                    });

                    if (parent.children && parent.children.length > 0) {
                        for (let i = 0; i < parent.children.length; i++) {
                            await this.browser(parent.children[i], parts, result);
                        }
                    }
                }
            }
        } else {
            if (node.part.isFileFilter) {
                const pathToBrowser = node.parent ? node.parent.path : node.path;
                const git: Git = this.isGitHub() ? new Github(this.url, this.token) : new Gitea(this.url, this.token);
                const gitFiles = await git.fetchFileContent(this.branch, this.owner, this.repo, pathToBrowser);
                node.children = [];
                if (Array.isArray(gitFiles)) {
                    _.forEach(gitFiles, (gitFile: GitFile) => {
                        if (gitFile.type === 'file') {

                            const gitFileName = path.basename(gitFile.path);
                            const gitFileExtension = path.extname(gitFile.path);
                            const gitFileNameOnly = path.basename(gitFile.path, gitFileExtension);

                            const fileExtensionFilter = path.extname(node.part.name);
                            const fileNameFilter = path.basename(node.part.name, fileExtensionFilter);

                            // TODO: matching using regex???
                            const isFileMatched =
                                (
                                    fileNameFilter === '*' && fileExtensionFilter === '.*'
                                ) ||
                                (
                                    fileNameFilter === '*' && fileExtensionFilter !== '.*' && fileExtensionFilter === gitFileExtension
                                ) ||
                                (
                                    fileNameFilter !== '*' && fileExtensionFilter === '.*' && fileNameFilter === gitFileNameOnly
                                ) ||
                                (
                                    fileNameFilter === gitFileNameOnly && fileExtensionFilter === gitFileExtension
                                ) ||
                                (
                                    node.part.name === gitFileName
                                );
                            if (isFileMatched) {
                                node.children.push(new FileNode({
                                    type: 'file',
                                    part: part,
                                    path: gitFile.path,
                                    children: [],
                                    level: node.level + 1,
                                    parent: node,
                                }));

                                result.push(gitFile.path);
                            }
                        }
                    });
                }
            }
        }

        return result;
    }

    private isGitHub(): boolean {
        return this.url === Github.McpServerUrl;
    }
}