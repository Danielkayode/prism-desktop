import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class MCPClient {
    private client: Client;

    constructor() {
        this.client = new Client(
            { name: "Aide", version: "0.6.1" },
            { capabilities: { tools: {}, resources: {} } }
        );
    }

    async connectToServer(command: string, args: string[]) {
        const transport = new StdioClientTransport({
            command,
            args,
        });
        await this.client.connect(transport);
    }

    async listTools() {
        return await this.client.listTools();
    }

    async callTool(toolName: string, args: any) {
        return await this.client.callTool(toolName, { arguments: args });
    }

    async listResources() {
        return await this.client.listResources();
    }
}
