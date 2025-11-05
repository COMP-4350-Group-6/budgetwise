/**
 * LLM Model Configuration
 * Centralizes model metadata and pricing for easy maintenance
 */

export interface LLMModelPricing {
  /** Cost per 1M input tokens in USD */
  inputPerMillion: number;
  /** Cost per 1M output tokens in USD */
  outputPerMillion: number;
  /** Cost per 1K images for vision models (optional) */
  imagePerThousand?: number;
}

export interface LLMModelConfig {
  /** Unique model identifier (e.g., 'mistralai/mistral-small') */
  id: string;
  /** Provider name (e.g., 'openrouter', 'anthropic') */
  provider: string;
  /** Display name */
  name: string;
  /** Model description */
  description?: string;
  /** Maximum context window size */
  maxContextTokens: number;
  /** Pricing information */
  pricing: LLMModelPricing;
  /** Supported capabilities */
  capabilities: {
    chat: boolean;
    vision: boolean;
    functionCalling: boolean;
  };
  /** Whether this is a free tier model */
  isFree: boolean;
}

/**
 * Registry of supported LLM models with their configurations
 * Source: https://openrouter.ai/models
 */
export const LLM_MODEL_REGISTRY: Record<string, LLMModelConfig> = {
  // === Mistral Models ===
  'mistralai/mistral-small': {
    id: 'mistralai/mistral-small',
    provider: 'openrouter',
    name: 'Mistral Small',
    description: '22B parameters, cost-effective mid-tier model with multilingual support',
    maxContextTokens: 32_768,
    pricing: {
      inputPerMillion: 0.20,
      outputPerMillion: 0.60,
    },
    capabilities: {
      chat: true,
      vision: false,
      functionCalling: true,
    },
    isFree: false,
  },

  // === Google Gemini Models ===
  'google/gemini-2.0-flash-exp:free': {
    id: 'google/gemini-2.0-flash-exp:free',
    provider: 'openrouter',
    name: 'Gemini 2.0 Flash (Experimental, Free)',
    description: 'Free tier experimental model with fast TTFT',
    maxContextTokens: 1_048_576,
    pricing: {
      inputPerMillion: 0,
      outputPerMillion: 0,
    },
    capabilities: {
      chat: true,
      vision: true,
      functionCalling: true,
    },
    isFree: true,
  },

  'google/gemini-2.0-flash-001': {
    id: 'google/gemini-2.0-flash-001',
    provider: 'openrouter',
    name: 'Gemini 2.0 Flash',
    description: 'Fast TTFT with multimodal understanding and coding capabilities',
    maxContextTokens: 1_048_576,
    pricing: {
      inputPerMillion: 0.10,
      outputPerMillion: 0.40,
      imagePerThousand: 25.80, // $0.0258 per 1K images
    },
    capabilities: {
      chat: true,
      vision: true,
      functionCalling: true,
    },
    isFree: false,
  },

  'google/gemini-2.0-flash-lite-001': {
    id: 'google/gemini-2.0-flash-lite-001',
    provider: 'openrouter',
    name: 'Gemini 2.0 Flash Lite',
    description: 'Lightweight version for cost-effective multimodal tasks',
    maxContextTokens: 1_048_576,
    pricing: {
      inputPerMillion: 0.075,
      outputPerMillion: 0.30,
    },
    capabilities: {
      chat: true,
      vision: true,
      functionCalling: true,
    },
    isFree: false,
  },

  'google/gemini-flash-1.5': {
    id: 'google/gemini-flash-1.5',
    provider: 'openrouter',
    name: 'Gemini Flash 1.5',
    description: 'Previous generation flash model',
    maxContextTokens: 1_048_576,
    pricing: {
      inputPerMillion: 0.075,
      outputPerMillion: 0.30,
    },
    capabilities: {
      chat: true,
      vision: true,
      functionCalling: true,
    },
    isFree: false,
  },

  'google/gemini-pro-1.5': {
    id: 'google/gemini-pro-1.5',
    provider: 'openrouter',
    name: 'Gemini Pro 1.5',
    description: 'High-capability model for complex tasks',
    maxContextTokens: 2_097_152,
    pricing: {
      inputPerMillion: 1.25,
      outputPerMillion: 5.00,
    },
    capabilities: {
      chat: true,
      vision: true,
      functionCalling: true,
    },
    isFree: false,
  },

  // === Anthropic Claude Models ===
  'anthropic/claude-3-haiku': {
    id: 'anthropic/claude-3-haiku',
    provider: 'openrouter',
    name: 'Claude 3 Haiku',
    description: 'Fast and cost-effective for simple tasks',
    maxContextTokens: 200_000,
    pricing: {
      inputPerMillion: 0.25,
      outputPerMillion: 1.25,
    },
    capabilities: {
      chat: true,
      vision: true,
      functionCalling: true,
    },
    isFree: false,
  },

  'anthropic/claude-3-sonnet': {
    id: 'anthropic/claude-3-sonnet',
    provider: 'openrouter',
    name: 'Claude 3 Sonnet',
    description: 'Balanced performance and cost',
    maxContextTokens: 200_000,
    pricing: {
      inputPerMillion: 3.00,
      outputPerMillion: 15.00,
    },
    capabilities: {
      chat: true,
      vision: true,
      functionCalling: true,
    },
    isFree: false,
  },

  'anthropic/claude-3-opus': {
    id: 'anthropic/claude-3-opus',
    provider: 'openrouter',
    name: 'Claude 3 Opus',
    description: 'Most capable Claude model for complex tasks',
    maxContextTokens: 200_000,
    pricing: {
      inputPerMillion: 15.00,
      outputPerMillion: 75.00,
    },
    capabilities: {
      chat: true,
      vision: true,
      functionCalling: true,
    },
    isFree: false,
  },
};

/**
 * Get model configuration by ID
 */
export function getLLMModel(modelId: string): LLMModelConfig | undefined {
  return LLM_MODEL_REGISTRY[modelId];
}

/**
 * Calculate cost in cents for a given model and token usage
 */
export function calculateLLMCost(
  modelId: string,
  promptTokens: number,
  completionTokens: number
): number {
  const model = getLLMModel(modelId);
  
  if (!model || model.isFree) {
    return 0;
  }

  const inputCost = (promptTokens / 1_000_000) * model.pricing.inputPerMillion;
  const outputCost = (completionTokens / 1_000_000) * model.pricing.outputPerMillion;
  
  // Convert to cents and round
  return Math.round((inputCost + outputCost) * 100);
}

/**
 * Get all models for a specific use case
 */
export function getModelsForCapability(capability: keyof LLMModelConfig['capabilities']): LLMModelConfig[] {
  return Object.values(LLM_MODEL_REGISTRY).filter(model => model.capabilities[capability]);
}

/**
 * Get recommended model for a specific task
 */
export const RECOMMENDED_MODELS = {
  categorization: 'mistralai/mistral-small', // Cost-effective for simple classification
  invoiceParsing: 'google/gemini-2.0-flash-001', // Vision + good value
  chatbot: 'anthropic/claude-3-sonnet', // Balanced capability and cost
} as const;