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

    hashedFileContent: string | null = null;

    private buildHashString(): string {
        return `${this.url}-${this.token}-${this.branch}-${this.owner}-${this.repo}-${this.path}-${this.hashedFileContent}-${this.commonSettings}`;
    }

    private computeChecksum(): string {
        return md5(this.buildHashString());
    }

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
            this.id = `${new Date().toISOString()}_${hash}`;
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
}
