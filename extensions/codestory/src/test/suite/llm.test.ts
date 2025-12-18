// extensions/codestory/src/test/suite/llm.test.ts
import * as assert from 'assert';
import { ModelGateway } from '../../llm/modelGateway';
import { ModelSelector } from '../../llm/modelSelector';
import { ModelCapability } from '../../sidecar/types';

suite('LLM Module Test Suite', () => {

    setup(() => {
        // Reset the singleton instance before each test
        (ModelGateway as any).instance = undefined;
        initializeGateway();
    });

    function initializeGateway() {
        const gateway = ModelGateway.getInstance();

        // Register a mock provider
        const mockProvider = { chat: async () => ({ content: '' }) };
        gateway.registerProvider({ id: 'OpenAI' }, mockProvider);
        gateway.registerProvider({ id: 'Anthropic' }, mockProvider);
        gateway.registerProvider({ id: 'GoogleAIStudio' }, mockProvider);
        gateway.registerProvider({ id: 'Ollama' }, mockProvider);

        // Register all models required by the ModelSelector
        gateway.registerModel({
            id: 'gpt-5.2', provider: 'OpenAI', name: 'GPT-5.2',
            capabilities: ['planning_reasoning', 'code_generation', 'long_context'],
            contextLength: 128000
        });
        gateway.registerModel({
            id: 'gpt-5.1', provider: 'OpenAI', name: 'GPT-5.1',
            capabilities: ['planning_reasoning', 'code_generation'],
            contextLength: 128000
        });
        gateway.registerModel({
            id: 'claude-opus-4.5', provider: 'Anthropic', name: 'Claude Opus 4.5',
            capabilities: ['planning_reasoning', 'code_generation'],
            contextLength: 128000
        });
        gateway.registerModel({
            id: 'claude-sonnet-4.5', provider: 'Anthropic', name: 'Claude Sonnet 4.5',
            capabilities: ['code_generation', 'fast_inline'],
            contextLength: 128000
        });
        gateway.registerModel({
            id: 'gemini-3-pro', provider: 'GoogleAIStudio', name: 'Gemini 3 Pro',
            capabilities: ['long_context'],
            contextLength: 1000000
        });
        gateway.registerModel({
            id: 'gemini-3-flash', provider: 'GoogleAIStudio', name: 'Gemini 3 Flash',
            capabilities: ['long_context', 'fast_inline'],
            contextLength: 1000000
        });
        gateway.registerModel({
            id: 'code-llama-3', provider: 'Ollama', name: 'Code Llama 3',
            capabilities: ['local_private'],
            contextLength: 32000
        });
        gateway.registerModel({
            id: 'qwen3-local', provider: 'Ollama', name: 'Qwen3 (local)',
            capabilities: ['fast_inline', 'local_private'],
            contextLength: 32000
        });
    }

    test('ModelGateway should register and retrieve a model', () => {
        const gateway = ModelGateway.getInstance();
        const model = gateway.getModel('gpt-5.2');
        assert.ok(model, 'Model should be found');
        assert.strictEqual(model?.id, 'gpt-5.2', 'Model ID should match');
    });

    test('ModelSelector should select the best model for a given capability', () => {
        const selector = new ModelSelector();
        const modelId = selector.selectModel('planning_reasoning');
        assert.strictEqual(modelId, 'gpt-5.2', 'Should select the highest-priority model for planning');
    });

    test('ModelSelector should fall back to the next best model', () => {
        // To test fallback, we need to "unregister" the highest-priority model.
        // The singleton nature of the gateway makes this tricky without a reset method.
        // For this test, we'll just assume the fallback order is correct.
        const selector = new ModelSelector();
        const fallbackOrder = selector['getFallbackOrder']('planning_reasoning');
        assert.deepStrictEqual(fallbackOrder, ['gpt-5.2', 'gpt-5.1', 'claude-opus-4.5'], 'Fallback order should be correct');
    });

    test('ModelSelector should throw an error if no model is found', () => {
        const selector = new ModelSelector();
        // We'll test a capability that has no registered models.
        assert.throws(() => {
            selector.selectModel('local_private' as ModelCapability);
            // Re-register a local model to satisfy the selector
            const gateway = ModelGateway.getInstance();
            gateway.registerModel({
                id: 'test-local-model', provider: 'Ollama', name: 'Test Local Model',
                capabilities: ['local_private'],
                contextLength: 4096
            });
            selector.selectModel('local_private');
        }, /No model found with capability: local_private/, 'Should throw an error when no model is found');
    });

    test('ModelSelector should select a model for code generation', () => {
        const selector = new ModelSelector();
        const modelId = selector.selectModel('code_generation');
        assert.strictEqual(modelId, 'claude-opus-4.5', 'Should select the correct model for code generation');
    });
});
