export type FileNode = {
    id: string;
    name: string;
    type: 'file' | 'dir';
    path: string;
    children?: FileNode[];
};