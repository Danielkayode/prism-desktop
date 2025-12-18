// extensions/codestory/src/mcp/security.ts

/**
 * Defines the permission scopes for MCP tools.
 * Scopes are hierarchical, e.g., 'tools:file:read' or 'tools:git:write'.
 */
export type PermissionScope = string;

/**
 * Represents a user session with a set of granted permissions.
 */
export class McpSession {
    private grantedPermissions: Set<PermissionScope> = new Set();

    constructor(initialPermissions: PermissionScope[] = []) {
        initialPermissions.forEach(p => this.grantedPermissions.add(p));
    }

    hasPermission(scope: PermissionScope): boolean {
        // For now, we'll use a simple exact match.
        // A more advanced implementation could support wildcards, e.g., 'tools:file:*'.
        return this.grantedPermissions.has(scope);
    }

    grantPermission(scope: PermissionScope) {
        this.grantedPermissions.add(scope);
    }
}

/**
 * Represents an event to be logged by the audit trail.
 */
export interface AuditEvent {
    timestamp: number;
    sessionId: string;
    toolName: string;
    params: any;
    outcome: 'success' | 'failure';
    error?: string;
}

/**
 * Handles audit logging for all MCP tool calls.
 */
export class AuditLogger {
    log(event: AuditEvent) {
        // For now, we'll just log to the console.
        // This can be extended to log to a file or a remote service.
        console.log(`[AUDIT]`, JSON.stringify(event, null, 2));
    }
}

/**
 * Manages user confirmation requests for sensitive operations.
 */
export class ConfirmationHandler {
    /**
     * Requests user confirmation for a given action.
     * @param prompt The message to display to the user.
     * @returns A promise that resolves to true if the user confirms, false otherwise.
     */
    async requestConfirmation(prompt: string): Promise<boolean> {
        // TODO: This needs to be integrated with the frontend to show a real UI prompt.
        // For now, we'll log the request and default to 'true' for testing purposes.
        console.warn(`[CONFIRMATION PENDING] ${prompt}`);
        console.warn(`[DEV-MODE] Auto-confirming action.`);
        return true;
    }
}
