/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ModelProviderConfiguration, ModelSelection, ProviderSpecificConfiguration } from 'vscode';
import { SidecarResponsePosition, UserContext } from '../server/types';


export type OptionString =
	| { type: 'Some'; value: string }
	| { type: 'None' };

export type AgentStep =
	| { Path: { query: string; response: string; paths: string[] } }
	| { Code: { query: string; code_snippets: CodeSpan[] } }
	| { Proc: { query: string; paths: string[]; response: string } };

export type AgentState =
	| 'Search'
	| 'Plan'
	| 'Explain'
	| 'CodeEdit'
	| 'FixSignals'
	| 'Finish';

export interface CodeSpan {
	file_path: string;
	alias: number;
	start_line: number;
	end_line: number;
	data: string;
	score: number | null;
}

export interface SemanticSearchResponse {
	session_id: string;
	query: string;
	code_spans: CodeSpan[];
}

export interface Answer {
	answer_up_until_now: string;
	delta: string | null;
}

export interface ConversationMessageVariableInformation {
	start_position: SidecarResponsePosition;
	end_position: SidecarResponsePosition;
	fs_file_path: string;
	name: string;
	variable_type: SidecarVariableType;
}

export type ConversationState =
	| 'Pending'
	| 'Started'
	| 'StreamingAnswer'
	| 'ReRankingStarted'
	| 'ReRankingFinished'
	| 'Finished';

export interface ConversationMessage {
	message_id: string;
	// We also want to store the session id here so we can load it and save it
	session_id: string;
	// The query which the user has asked
	query: string;
	// The steps which the agent has taken up until now
	steps_taken: AgentStep[];
	// The state of the agent
	agent_state: AgentState;
	// The file paths we are interested in, can be populated via search or after
	// asking for more context
	file_paths: String[];
	// The span which we found after performing search
	code_spans: CodeSpan[];
	// The span which user has selected and added to the context
	user_selected_code_span: CodeSpan[];
	// The files which are open in the editor
	open_files: String[];
	// The status of this conversation
	conversation_state: ConversationState;
	// Final answer which is going to get stored here
	answer: Answer | null;
	// Last updated
	last_updated: number;
	// Created at
	created_at: number;
	// checks the variable information which are present in the message
	user_variables: ConversationMessageVariableInformation[];
	// plan if it exists
	plan: Plan | null;
}

export type ConversationMessageOkay =
	| { type: 'Ok'; data: ConversationMessage };

export interface Repository {
	disk_path: string;
	sync_status: SyncStatus;
	last_commit_unix_secs: number;
	last_index_unix_secs: number;
}


export type SyncStatus =
	| { tag: 'error'; message: string }
	| { tag: 'uninitialized' }
	| { tag: 'cancelling' }
	| { tag: 'cancelled' }
	| { tag: 'queued' }
	| { tag: 'syncing' }
	| { tag: 'indexing' }
	| { tag: 'done' }
	| { tag: 'removed' }
	| { tag: 'remote_removed' };

export interface RepoStatus {
	// The string here is generated from RepoRef.to_string()
	repo_map: { [key: string]: Repository };
}


/**
 * The positions here start with 0 index
 */
export interface Position {
	line: number;
	character: number;
}


export interface ContextSelection {
	relativePath: string;
	fsFilePath: string;
	workingDirectory: string;
	startPosition: Position;
	endPosition: Position;
}

export interface CurrentViewContext {
	// The string here is generated from RepoRef.to_string()
	repo_ref: string;
	// The relative path of the file
	relative_path: string;
	// The line number
	line_number: number;
	// The column number
	column_number: number;
	// the current text which is present on the active editor
	current_text: string;
	// The active selection
	selection: ContextSelection[] | null;
}

// We also get the definitions of the symbols which are present
export interface PreciseContext {
	symbol: {
		fuzzyName?: string;
	};
	hoverText: string[];
	definitionSnippet: {
		context: string;
		startLine: number;
		endLine: number;
	};
	fsFilePath: string;
	relativeFilePath: string;
	range: {
		startLine: number;
		startCharacter: number;
		endLine: number;
		endCharacter: number;
	};
}

export interface DeepContextForView {
	// The string here is generated from RepoRef.to_string()
	repoRef: string;
	preciseContext: PreciseContext[];
	// Where is the cursor positioned, this will be useful context
	// for the llm
	cursorPosition: {
		startPosition: Position;
		endPosition: Position;
	} | null;
	// What is the data present in the current viewport
	currentViewPort: {
		startPosition: Position;
		endPosition: Position;
		relativePath: string;
		fsFilePath: string;
		textOnScreen: string;
	} | null;
	language: string;
}


export interface TextDocument {
	text: String;
	utf8Array: number[];
	language: String;
	fsFilePath: String;
	relativePath: String;
	lineCount: number;
}


export interface SnippetInformation {
	startPosition: {
		line: number;
		character: number;
		byteOffset: number;
	};
	endPosition: {
		line: number;
		character: number;
		byteOffset: number;
	};
	shouldUseExactMatching: boolean;
}

export enum DiagnosticSeverity {
	Error = 0,
	Warning = 1,
	Information = 2,
	Hint = 3,
}

export interface DiagnosticCode {
	strValue: string | null;
	numValue: number | null;
	information: {
		strValue: string | null;
		numValue: number | null;
		fsFilePath: string;
	} | null;
}


export interface InEditorRequest {
	repoRef: string;
	query: string;
	threadId: string;
	language: string;
	snippetInformation: SnippetInformation;
	textDocumentWeb: TextDocument;
	diagnosticsInformation: DiagnosticInformationFromEditor | null;
	userContext: UserContext;
}

export interface DiagnosticInformationFromEditor {
	firstMessage: string;
	diagnosticInformation: DiagnosticInformation[];
}

export interface DiagnosticInformation {
	promptParts: string[];
	relatedInformation: DiagnosticRelatedInformation[];
}

export interface DiagnosticRelatedInformation {
	text: string;
	language: string;
	range: {
		startPosition: {
			line: number;
			character: number;
			byteOffset: number;
		};
		endPosition: {
			line: number;
			character: number;
			byteOffset: number;
		};
	};
}


export type InLineAgentAction =
	| 'Code'
	| 'Doc'
	| 'Edit'
	| 'Tests'
	| 'Fix'
	| 'Explain'
	| 'Unknown'
	| { type: 'DecideAction'; query: string };


export type InLineAgentMessageState =
	| 'Pending'
	| 'Started'
	| 'StreamingAnswer'
	| 'Finished'
	| 'Errored';

export interface InLineAgentDocumentSymbol {
	name: string | null;
	start_position: Position;
	end_position: Position;
	kind: string | null;
	code: string;
}


export interface InLineAgentAnswer {
	answer_up_until_now: string;
	delta: string | null;
	state: InLineAgentMessageState;
	document_symbol: InLineAgentDocumentSymbol | null;
	context_selection: InLineAgentContextSelection | null;
	modelId: string; // The ID of the model used, e.g., "gpt-5.2"
}


export interface InLineAgentMessage {
	session_id: string;
	message_id: string;
	query: string;
	steps_taken: InLineAgentAction[];
	message_state: InLineAgentMessageState;
	answer: InLineAgentAnswer | null;
	last_updated: number;
	created_at: number;
	keep_alive: string | undefined;
}

export interface InLineAgentContextSelection {
	above: InLineAgentSelectionData;
	below: InLineAgentSelectionData;
	range: InLineAgentSelectionData;
}

export interface InLineAgentSelectionData {
	has_content: boolean;
	first_line_index: number;
	last_line_index: number;
	lines: string[];
}


export interface InEditorTreeSitterDocumentationQuery {
	language: string;
	source: string;
}

export interface InEditorTreeSitterDocumentationReply {
	documentation: string;
}

export type SidecarVariableType =
	| 'File'
	| 'CodeSymbol'
	| 'Selection';

export interface SidecarVariableTypes {
	name: string;
	start_position: SidecarResponsePosition;
	end_position: SidecarResponsePosition;
	fs_file_path: string;
	type: SidecarVariableType;
	content: string;
	language: string;
}


export type DiffActionResponse =
	| 'AcceptCurrentChanges'
	| 'AcceptIncomingChanges'
	| 'AcceptBothChanges';

export type TextEditStreaming =
	| {
		Start: {
			code_block_index: number;
			context_selection: InLineAgentContextSelection;
		};
	}
	| {
		End: {
			code_block_index: number;
			reason: string;
		};
	}
	| {
		EditStreaming: {
			code_block_index: number;
			range: {
				startPosition: {
					line: number;
					character: number;
				};
				endPosition: {
					line: number;
					character: number;
				};
			};
			content_up_until_now: string;
			content_delta: string;
		};
	};


export type EditFileResponse =
	| { Message: { message: string } }
	| {
		Action: {
			action: DiffActionResponse; range: {
				start_position: {
					line: number;
					character: number;
				};
				end_position: {
					line: number;
					character: number;
				};
			}; content: string; previous_content: string;
		};
	}
	| {
		TextEdit: {
			range: {
				startPosition: {
					line: number;
					character: number;
				};
				endPosition: {
					line: number;
					character: number;
				};
			}; content: string;
			should_insert: boolean;
		};
	}
	| { Status: { session_id: string; status: string } }
	| { TextEditStreaming: { data: TextEditStreaming } };

export type SyncUpdate =
	| { ProgressEvent: { ref: string; ev: ProgressEvent } }
	| { KeepAlive: { timestamp: number } };

export interface Progress {
	ref: string;
	ev: ProgressEvent;
}

export type ProgressEvent =
	| { index_percent: number }
	| { sync_status: SyncStatus };



export type PlanStep = {
	id: string;
	index: number;
	title: string;
	files_to_edit: string[];
	description: string;
};
export type Plan = {
	id: string;
	sessionId: string;
	name: string;
	steps: PlanStep[];
	initial_context: string;
	user_query: string;
	checkpoint: number | null;
	storage_path: string;
};
export type PlanResponse = {
	plan?: Plan;
	success: boolean;
	error_if_any?: string;
};

// New capability-based types for the Model Gateway

export type ModelCapability =
	| 'planning_reasoning'
	| 'code_generation'
	| 'long_context'
	| 'fast_inline'
	| 'local_private';

export type ModelProviderId =
	| 'OpenAI'
	| 'Anthropic'
	| 'GoogleAIStudio'
	| 'OpenRouter'
	| 'Ollama'
	| 'LMStudio'
	| 'FireworksAI'
	| 'TogetherAI';

export interface ModelDefinition {
	id: string; // e.g., 'gpt-5.2'
	provider: ModelProviderId;
	name: string; // User-facing name, e.g., "GPT-5.2"
	capabilities: ModelCapability[];
	contextLength: number;
	cost?: {
		prompt: number; // cost per 1M tokens
		completion: number; // cost per 1M tokens
	};
	infoUrl?: string;
	description?: string;
}

export interface ProviderConfiguration {
	id: ModelProviderId;
	apiKey?: string;
	apiBase?: string;
}

export type IdentifierNodeInformation = {
	name: string;
	range: {
		startPosition: {
			line: number;
			character: number;
		};
		endPosition: {
			line: number;
			character: number;
		};
	};
};

export type IdentifierNodeType = {
	identifier_nodes: IdentifierNodeInformation[];
	function_parameters: IdentifierNodeInformation[];
	import_nodes: IdentifierNodeInformation[];
};

// The old helper functions for model configuration have been removed.
// This logic will be replaced by the new Model Gateway and Model Selector.
