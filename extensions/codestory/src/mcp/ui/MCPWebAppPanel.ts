import * as vscode from 'vscode';
import * as path from 'path';

export class MCPWebAppPanel {
    public static currentPanel: MCPWebAppPanel | undefined;

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionPath: string;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionPath: string) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (MCPWebAppPanel.currentPanel) {
            MCPWebAppPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'mcpServerManagement',
            'MCP Server Management',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'dist'))],
            }
        );

        MCPWebAppPanel.currentPanel = new MCPWebAppPanel(panel, extensionPath);
    }

    private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
        this._panel = panel;
        this._extensionPath = extensionPath;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'addServer':
                        this._addServer(message.server);
                        return;
                    case 'removeServer':
                        // Handle removing a server
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    private _addServer(server: { command: string, args: string[] }) {
        const { command, args } = server;
        const id = `${command}-${args.join('-')}`;
        vscode.commands.executeCommand('codestory.connectToMcpServer', id, command, args);
    }

    public dispose() {
        MCPWebAppPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.title = 'MCP Server Management';
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptPathOnDisk = vscode.Uri.file(
            path.join(this._extensionPath, 'dist', 'server-management.js')
        );

        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

        const stylesPathOnDisk = vscode.Uri.file(
            path.join(this._extensionPath, 'dist', 'server-management.css')
        );

        const stylesUri = webview.asWebviewUri(stylesPathOnDisk);

        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF--8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${stylesUri}" rel="stylesheet">
                <title>MCP Server Management</title>
            </head>
            <body>
                <h1>MCP Server Management</h1>
                <div id="server-list"></div>
                <div class="add-server-form">
                    <h2>Add Server</h2>
                    <input type="text" id="server-command" placeholder="Server command">
                    <input type="text" id="server-args" placeholder="Server arguments (comma-separated)">
                    <button id="add-server-button">Add Server</button>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
