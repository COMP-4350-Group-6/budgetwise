import { z } from "zod";

const CategoryNameSchema = z.string()
  .min(1, "Category name cannot be empty")
  .max(50, "Category name too long")
  .regex(/^[a-zA-Z\s]+$/, "Category name can only contain letters A-Z and spaces");

export const CreateCategoryInputSchema = z.object({
  name: CategoryNameSchema,
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).optional(),
});

export const UpdateCategoryInputSchema = CreateCategoryInputSchema.partial().extend({
  isDefault: z.boolean().optional(),
});

export const CategoryRowSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  name: CategoryNameSchema,
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  is_default: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const CategoryDTO = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: CategoryNameSchema,
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategoryInputSchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryInputSchema>;
export type CategoryRow = z.infer<typeof CategoryRowSchema>;
export type CategoryDTO = z.infer<typeof CategoryDTO>;