import md5 from 'md5';

export default class Session {

    id: string = crypto.randomUUID();
    checksum: string | null = null;

    url: string = $state("");
    token: string = $state("");
    branch: string = $state("");
    owner: string = $state("");
    repo: string = $state("");
    path: string = $state("");
    commonSettings: string = $state("");

    runBFlowCount: number = 0;

    hashedFileContent: string | null = null;

    hasRequiredConfig(): boolean {
        if ((this.url && this.token && this.branch && this.owner && this.repo && this.path) || this.commonSettings) {
            return true;
        }
        return false;
    }

    hasConfigChanged(): boolean {
        return this.computeChecksum() !== this.checksum;
    }

    createSession(): boolean {
        if (!this.hasRequiredConfig()) return false;

        const hash = this.computeChecksum();
        if (!this.id || hash !== this.checksum) {
            this.checksum = hash;
            this.id = `${new Date().getTime()}_${hash}`;
        }
        return true;
    }

    ensureSession() {
        if (this.hasConfigChanged()) {
            this.createSession();
        }
    }

    setHashedFileContent(value: string) {
        this.hashedFileContent = value;
    }

    toJson() {
        return {
            id: this.id,
            checksum: this.checksum,
            url: this.url,
            token: this.token,
            branch: this.branch,
            owner: this.owner,
            repo: this.repo,
            path: this.path,
            hashedFileContent: this.hashedFileContent,
            commonSettings: this.commonSettings,
        }
    }

    increaseRunBFlowCount() {
        this.runBFlowCount += 1;
    }

    getRunBFlowCount(): number {
        return this.runBFlowCount;
    }

    private buildHashString(): string {
        return `${this.url}-${this.token}-${this.branch}-${this.owner}-${this.repo}-${this.path}-${this.hashedFileContent}-${this.commonSettings}`;
    }

    private computeChecksum(): string {
        return md5(this.buildHashString());
    }
}
