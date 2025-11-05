import { z } from 'zod';

/**
 * LLM Call Type Schema
 */
export const LLMCallTypeSchema = z.enum(['auto_categorize', 'auto_invoice']);
export type LLMCallType = z.infer<typeof LLMCallTypeSchema>;

/**
 * LLM Call Status Schema
 */
export const LLMCallStatusSchema = z.enum(['success', 'error']);
export type LLMCallStatus = z.infer<typeof LLMCallStatusSchema>;

/**
 * LLM Call Schema
 */
export const LLMCallSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  provider: z.string().min(1),
  model: z.string().min(1),
  callType: LLMCallTypeSchema,
  requestPayload: z.record(z.string(), z.unknown()),
  responsePayload: z.record(z.string(), z.unknown()).optional(),
  promptTokens: z.number().int().nonnegative().optional(),
  completionTokens: z.number().int().nonnegative().optional(),
  totalTokens: z.number().int().nonnegative().optional(),
  estimatedCostCents: z.number().int().nonnegative().optional(),
  status: LLMCallStatusSchema,
  errorMessage: z.string().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  createdAt: z.date(),
});

export type LLMCallInput = z.infer<typeof LLMCallSchema>;

/**
 * Create LLM Call Input Schema
 */
export const CreateLLMCallSchema = LLMCallSchema.omit({ 
  id: true, 
  createdAt: true 
});

export type CreateLLMCallInput = z.infer<typeof CreateLLMCallSchema>;