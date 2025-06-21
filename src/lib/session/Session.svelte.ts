import md5 from 'md5';

export default class Session {

    id: string = crypto.randomUUID(); // default 
    checksum: string | null = null;

    mcpServerUrl: string = $state("");
    url: string = $state("");
    token: string = $state("");
    branch: string = $state("");
    owner: string = $state("");
    repo: string = $state("");
    path: string = $state("");

    private buildHashString(): string {
        return `${this.mcpServerUrl}-${this.url}-${this.token}-${this.branch}-${this.owner}-${this.repo}-${this.path}`;
    }

    private computeChecksum(): string {
        return md5(this.buildHashString());
    }

    hasRequiredConfig(): boolean {
        return !!(this.mcpServerUrl && this.url && this.token && this.branch && this.owner && this.repo && this.path);
    }

    hasConfigChanged(): boolean {
        return this.computeChecksum() !== this.checksum;
    }

    createSession(): boolean {
        if (!this.hasRequiredConfig()) return false;

        const hash = this.computeChecksum();
        if (!this.id || hash !== this.checksum) {
            this.checksum = hash;
            this.id = `${new Date().toISOString()}-${hash}`;
        }
        return true;
    }

    ensureSession() {
        if (this.hasConfigChanged()) {
            this.createSession();
        }
    }
}
