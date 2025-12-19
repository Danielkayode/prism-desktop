/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as vscode from 'vscode';


import { InlineCompletionItemProvider } from './inline-completion-item-provider';
import { SideCarClient } from '../sidecar/client';
import { MCPClient } from '../mcp/client';

interface InlineCompletionItemProviderArgs {
	triggerNotice: ((notice: { key: string }) => void) | null;
	sidecarClient: SideCarClient;
	mcpClient: MCPClient;
}

export async function createInlineCompletionItemProvider({
	triggerNotice,
	sidecarClient,
	mcpClient,
}: InlineCompletionItemProviderArgs): Promise<vscode.Disposable> {

	const disposables: vscode.Disposable[] = [];

	const completionsProvider = new InlineCompletionItemProvider({
		sidecarClient,
		mcpClient,
		completeSuggestWidgetSelection: true,
		triggerNotice,
	});

	disposables.push(
		vscode.languages.registerInlineCompletionItemProvider(
			{ pattern: '**' },
			completionsProvider
		),
		completionsProvider
	);

	return {
		dispose: () => {
			for (const disposable of disposables) {
				disposable.dispose();
			}
		},
	};
}
