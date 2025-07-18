export default class GitFile {
    constructor(
        public name: string | null,
        public path: string | null,
        public sha: string | null,
        public type: "file" | "dir",
    ) { }
}