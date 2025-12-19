import * as vscode from 'vscode';

suite('MCP Web App Panel Test Suite', () => {
    test('Open MCP Web App Panel', async () => {
        await vscode.commands.executeCommand('codestory.openMCPWebAppPanel');
        // It's not possible to take a screenshot of a webview from a test,
        // so this test only verifies that the command can be executed without error.
        // I will manually verify the UI and take a screenshot.
    });
});
