// extensions/codestory/src/mcp/client.ts
import * as rpc from 'vscode-jsonrpc/node';
import { InitializeRequest, InitializeResult } from './types'; // Assuming types are defined in a separate file

export class McpClient {
    private connection: rpc.MessageConnection;

    constructor(reader: rpc.MessageReader, writer: rpc.MessageWriter) {
        this.connection = rpc.createMessageConnection(reader, writer);
        this.connection.listen();
    }

    public async initialize(params: InitializeRequest): Promise<InitializeResult> {
        return this.connection.sendRequest('initialize', params);
    }

    // Placeholder for handling incoming notifications
    public onNotification(method: string, handler: rpc.NotificationHandler<any>) {
        this.connection.onNotification(method, handler);
    }
}
