// extensions/codestory/src/llm/modelSelector.ts
import {
    ModelCapability,
    ModelDefinition,
} from '../sidecar/types';
import { ModelGateway } from './modelGateway';

export class ModelSelector {
    private gateway: ModelGateway;

    constructor() {
        this.gateway = ModelGateway.getInstance();
    }

    /**
     * Selects the best model for a given capability, based on a predefined
     * fallback order.
     *
     * @param capability The desired model capability.
     * @returns The ID of the selected model.
     * @throws {Error} If no suitable model is found.
     */
    public selectModel(capability: ModelCapability): string {
        const fallbackOrder = this.getFallbackOrder(capability);

        for (const modelId of fallbackOrder) {
            const model = this.gateway.getModel(modelId);
            if (model && model.capabilities.includes(capability)) {
                return model.id;
            }
        }

        throw new Error(`No model found with capability: ${capability}`);
    }

    /**
     * A simple, hardcoded fallback order for now. This could be made
     * more dynamic in the future (e.g., based on user preferences or
     * real-time performance data).
     */
    private getFallbackOrder(capability: ModelCapability): string[] {
        switch (capability) {
            case 'planning_reasoning':
                return ['gpt-5.2', 'gpt-5.1', 'claude-opus-4.5'];
            case 'code_generation':
                return ['claude-opus-4.5', 'gpt-5.2', 'claude-sonnet-4.5', 'gpt-5.1'];
            case 'long_context':
                return ['gemini-3-pro', 'gpt-5.2', 'gemini-3-flash'];
            case 'fast_inline':
                return ['gemini-3-flash', 'claude-sonnet-4.5', 'qwen3-local'];
            case 'local_private':
                return ['code-llama-3', 'qwen3-local'];
            default:
                return [];
        }
    }
}

// Example usage (for demonstration purposes) can be found in the test suite.
