// extensions/codestory/src/mcp/tools.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { McpServer } from './server';

// Interfaces for the FileTools requests and responses, based on the MCP spec.

export interface FsReadParams {
    uri: string;
}

export interface FsReadResult {
    content: string;
}

export interface FsWriteParams {
    uri: string;
    content: string;
}

export interface FsWriteResult {
    success: boolean;
}

export interface FsListParams {
    uri: string;
}

export interface FsListResult {
    items: {
        uri: string;
        isDirectory: boolean;
    }[];
}

export interface FsSearchParams {
    query: string;
    rootUri: string;
}

export interface FsSearchResult {
    results: {
        uri: string;
        score: number;
    }[];
}

export class FileTools {
    constructor(private server: McpServer) {
        this.server.onRequest('file/read', (params) => this.read(params));
        this.server.onRequest('file/list', (params) => this.list(params));
        this.server.onRequest('file/search', (params) => this.search(params));
    }

    public async read(params: FsReadParams): Promise<FsReadResult> {
        const filePath = this.uriToPath(params.uri);
        const content = await fs.readFile(filePath, 'utf-8');
        return { content };
    }

    public async write(params: FsWriteParams): Promise<FsWriteResult> {
        const filePath = this.uriToPath(params.uri);
        await fs.writeFile(filePath, params.content, 'utf-8');
        return { success: true };
    }

    private async list(params: FsListParams): Promise<FsListResult> {
        const dirPath = this.uriToPath(params.uri);
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        return {
            items: items.map(item => ({
                uri: this.pathToUri(path.join(dirPath, item.name)),
                isDirectory: item.isDirectory(),
            })),
        };
    }

    private async search(params: FsSearchParams): Promise<FsSearchResult> {
        // This is a very basic search implementation. A more robust implementation
        // would use a dedicated search index.
        const rootPath = this.uriToPath(params.rootUri);
        const files = await glob(`**/*${params.query}*`, { cwd: rootPath });
        return {
            results: files.map(file => ({
                uri: this.pathToUri(path.join(rootPath, file)),
                score: 1.0, // Placeholder score
            })),
        };
    }

    private uriToPath(uri: string): string {
        // A simple conversion from file URIs to paths. This should be made
        // more robust to handle different URI schemes.
        return uri.replace('file://', '');
    }

    private pathToUri(filePath: string): string {
        return `file://${filePath}`;
    }
}
