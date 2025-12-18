// extensions/codestory/src/mcp/types.ts

// Based on the official MCP schema: https://github.com/modelcontextprotocol/specification/blob/main/schema/2025-11-25/schema.ts

export const JSONRPC_VERSION = "2.0";

export type RequestId = string | number;

export interface Request {
    method: string;
    params?: { [key: string]: any };
}

export interface JSONRPCRequest extends Request {
    jsonrpc: typeof JSONRPC_VERSION;
    id: RequestId;
}

export interface Result {
    [key: string]: any;
}

export interface Implementation {
    name: string;
    version: string;
}

export interface ClientCapabilities {
    // Define client capabilities as needed
}

export interface ServerCapabilities {
    tools?: {
        listChanged?: boolean;
    };
    // Define other server capabilities as needed
}

export interface InitializeRequest {
    protocolVersion: string;
    capabilities: ClientCapabilities;
    clientInfo: Implementation;
}

export interface InitializeResult extends Result {
    protocolVersion: string;
    capabilities: ServerCapabilities;
    serverInfo: Implementation;
    instructions?: string;
}
