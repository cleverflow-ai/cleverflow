import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { fileURLToPath } from 'url';

export interface GitSetting {
    id: string;
    url: string;
    token: string;
    owner: string;
    branch: string;
    repo: string;
}

export default class GitSettings {
    private settings: GitSetting[] = [];

    constructor() {
        this.loadSettings();
    }

    private loadSettings(): void {
        const currentFilePath = fileURLToPath(import.meta.url);
        const configDir = path.dirname(currentFilePath);
        // Navigate from src/tools/git to cleverflow.mcp.io root (where package.json is)
        // Going up: git -> tools -> src -> mcp (3 levels to cleverflow.mcp.io)
        const projectRoot = path.resolve(configDir, '..', '..', '..');
        const configPath = path.join(projectRoot, 'GitSettings.yaml');
        try {
            const fileContents = fs.readFileSync(configPath, 'utf8');
            this.settings = yaml.load(fileContents) as GitSetting[];
        } catch (error) {
            console.error(`Failed to load GitSettings from ${configPath}:`, error);
            this.settings = [];
        }
    }

    public getSettingById(id: string): GitSetting | undefined {
        return this.settings.find(setting => setting.id === id);
    }

    public getAllSettings(): GitSetting[] {
        return [...this.settings];
    }
}