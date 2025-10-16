import { z } from "zod";

export const CreateCategoryInputSchema = z.object({
  name: z.string()
    .min(1, "Category name cannot be empty")
    .max(50, "Category name too long")
    .regex(/^[a-zA-Z\s]+$/, "Category name can only contain letters A-Z and spaces"),
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(), // Hex color
  isActive: z.boolean().default(true),
});

export const UpdateCategoryInputSchema = CreateCategoryInputSchema.partial();

export const CategoryDTO = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.string(), // ISO date
  updatedAt: z.string(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategoryInputSchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryInputSchema>;
export type CategoryDTO = z.infer<typeof CategoryDTO>;