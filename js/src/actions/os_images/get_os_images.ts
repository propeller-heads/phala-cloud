import { z } from "zod";
import { defineAction } from "../../utils/define-action";

export const OSImagePublicSchema = z
  .object({
    name: z.string(),
    slug: z.string(),
    version: z.string(),
    os_image_hash: z.string().nullable(),
    is_dev: z.boolean(),
    requires_gpu: z.boolean(),
  })
  .passthrough();

export type OSImagePublic = z.infer<typeof OSImagePublicSchema>;

export const GetOsImagesRequestSchema = z
  .object({
    page: z.number().int().min(1).optional(),
    page_size: z.number().int().min(1).optional(),
    is_dev: z.boolean().optional(),
  })
  .strict();

export type GetOsImagesRequest = z.infer<typeof GetOsImagesRequestSchema>;

export const GetOsImagesResponseSchema = z
  .object({
    items: z.array(OSImagePublicSchema),
    total: z.number(),
    page: z.number(),
    page_size: z.number(),
    pages: z.number(),
  })
  .passthrough();

export type GetOsImagesResponse = z.infer<typeof GetOsImagesResponseSchema>;

const { action: getOsImages, safeAction: safeGetOsImages } = defineAction<
  GetOsImagesRequest | undefined,
  typeof GetOsImagesResponseSchema,
  GetOsImagesResponse
>(GetOsImagesResponseSchema, async (client, request) => {
  const validatedRequest = GetOsImagesRequestSchema.parse(request ?? {});
  return await client.get("/os-images", { params: validatedRequest });
});

export { getOsImages, safeGetOsImages };
