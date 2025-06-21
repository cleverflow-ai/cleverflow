import md5 from 'md5';

export default class Session {

    id: string = crypto.randomUUID();
    checksum: string | null = null;

    mcpServerUrl: string = $state("http://localhost:3000/mcp");
    url: string = $state("https://gitea-atlascopco-integration.clevernow.com/api/v1");
    token: string = $state("04f4b0dada8fa8632dc7541f2f2131c703693e7e");
    branch: string = $state("main");
    owner: string = $state("clevernow");
    repo: string = $state("atlascopco-dasm");
    path: string = $state("bflow/demo/simple-flow.mdoc");

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
            this.id = `${new Date().toISOString()}_${hash}`;
        }
        return true;
    }

    ensureSession() {
        if (this.hasConfigChanged()) {
            this.createSession();
        }
    }

    toJson() {
        return {
            id: this.id,
            checksum: this.checksum,
            mcpServerUrl: this.mcpServerUrl,
            url: this.url,
            token: this.token,
            branch: this.branch,
            owner: this.owner,
            repo: this.repo,
            path: this.path,
        }
    }
}
