// extensions/codestory/src/mcp/server.ts
import * as rpc from 'vscode-jsonrpc/node';
import { InitializeRequest, InitializeResult } from './types';
import { FileTools } from './tools';
import { AuditLogger, ConfirmationHandler, McpSession, PermissionScope } from './security';

export class McpServer {
    private connection: rpc.MessageConnection;
    private fileTools: FileTools;
    private sessions: Map<string, McpSession> = new Map();
    private auditLogger: AuditLogger = new AuditLogger();
    private confirmationHandler: ConfirmationHandler = new ConfirmationHandler();

    constructor() {
        this.connection = rpc.createMessageConnection(
            new rpc.IPCMessageReader(process),
            new rpc.IPCMessageWriter(process)
        );

        this.connection.onRequest('initialize', (params) => this.initialize(params));
        this.fileTools = new FileTools(this);

        // Example of a secure request handler
        this.onRequestWithSecurity(
            'file/write',
            'tools:file:write',
            true, // Requires confirmation
            (params) => this.fileTools.write(params)
        );
    }

    public start() {
        this.connection.listen();
    }

    public onRequest(method: string, handler: rpc.RequestHandler<any, any, any>) {
        this.connection.onRequest(method, handler);
    }

    public onRequestWithSecurity(
        method: string,
        requiredPermission: PermissionScope,
        requiresConfirmation: boolean,
        handler: rpc.RequestHandler<any, any, any>
    ) {
        this.connection.onRequest(method, async (params, token) => {
            const sessionId = "default_session"; // TODO: Implement proper session management
            const session = this.sessions.get(sessionId);

            if (!session || !session.hasPermission(requiredPermission)) {
                this.auditLogger.log({
                    timestamp: Date.now(),
                    sessionId,
                    toolName: method,
                    params,
                    outcome: 'failure',
                    error: 'Permission denied',
                });
                throw new rpc.ResponseError(rpc.ErrorCodes.InvalidRequest, 'Permission denied');
            }

            if (requiresConfirmation) {
                const confirmed = await this.confirmationHandler.requestConfirmation(
                    `Allow the action "${method}" with the following parameters? \n${JSON.stringify(params, null, 2)}`
                );
                if (!confirmed) {
                    this.auditLogger.log({
                        timestamp: Date.now(),
                        sessionId,
                        toolName: method,
                        params,
                        outcome: 'failure',
                        error: 'User declined action',
                    });
                    throw new rpc.ResponseError(rpc.ErrorCodes.InvalidRequest, 'User declined action');
                }
            }

            try {
                const result = await handler(params, token);
                this.auditLogger.log({
                    timestamp: Date.now(),
                    sessionId,
                    toolName: method,
                    params,
                    outcome: 'success',
                });
                return result;
            } catch (error: any) {
                this.auditLogger.log({
                    timestamp: Date.now(),
                    sessionId,
                    toolName: method,
                    params,
                    outcome: 'failure',
                    error: error.message,
                });
                throw error;
            }
        });
    }

    private initialize(params: InitializeRequest): InitializeResult {
        const sessionId = "default_session"; // TODO: Implement proper session management
        const session = new McpSession(['tools:file:read', 'tools:file:write', 'tools:file:list', 'tools:file:search']); // Grant all file permissions for now
        this.sessions.set(sessionId, session);

        console.log('MCP Server: Received initialize request', params);
        return {
            protocolVersion: '2025-11-25',
            capabilities: {
                tools: {
                    // Placeholder for tool capabilities
                }
            },
            serverInfo: {
                name: 'Prism MCP Server',
                version: '0.1.0',
            },
        };
    }
}

const server = new McpServer();
server.start();
