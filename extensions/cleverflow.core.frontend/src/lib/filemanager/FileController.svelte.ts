import type { FileNode } from "./FileNode.js";

export default class FileController {

    tree: FileNode | null = $state(null);
    fetchFolderChildren: (node: FileNode) => Promise<FileNode[]>;
    fetchFileContent: (node: FileNode) => Promise<FileNode[]>;

    constructor(
        fetchFolderChildren: (node: FileNode) => Promise<FileNode[]>,
        fetchFileContent: (node: FileNode) => Promise<FileNode[]>
    ) {
        this.fetchFolderChildren = fetchFolderChildren;
        this.fetchFileContent = fetchFileContent;
    }

    async open(node: FileNode) {
        if (node.type === 'dir') {
            const children = await this.fetchFolderChildren(node);
            this.setFolderChildren(node, children);
        } else {
            await this.fetchFileContent(node);
        }
    }

    private setFolderChildren(node: FileNode, children: FileNode[]) {
        node.children = children;
    }

}