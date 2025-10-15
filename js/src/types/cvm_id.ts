import { z } from "zod";

/**
 * CVM ID object schema - use this with .extend() to add more fields
 * This schema does NOT include the refine validation, allowing you to extend first
 *
 * @example
 * ```typescript
 * const MySchema = CvmIdObjectSchema.extend({
 *   name: z.string()
 * }).refine(
 *   (data) => !!(data.id || data.uuid || data.app_id || data.instance_id),
 *   "One of id, uuid, app_id, or instance_id must be provided"
 * );
 * ```
 */
export const CvmIdObjectSchema = z.object({
  /** Direct CVM ID (any format) */
  id: z.string().optional(),
  /** UUID format (with or without dashes) */
  uuid: z
    .string()
    .regex(
      /^[0-9a-f]{8}[-]?[0-9a-f]{4}[-]?4[0-9a-f]{3}[-]?[89ab][0-9a-f]{3}[-]?[0-9a-f]{12}$/i,
      "Invalid UUID format",
    )
    .optional(),
  /** App ID (40 characters, optionally prefixed with 'app_id_') */
  app_id: z.string().optional(),
  /** Instance ID (40 characters, optionally prefixed with 'instance_') */
  instance_id: z.string().optional(),
});

/**
 * Helper function to add CVM ID validation refine to any schema
 */
export const refineCvmId = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine(
    (data: unknown) => {
      const obj = data as { id?: string; uuid?: string; app_id?: string; instance_id?: string };
      return !!(obj.id || obj.uuid || obj.app_id || obj.instance_id);
    },
    {
      message: "One of id, uuid, app_id, or instance_id must be provided",
    },
  );

/**
 * Base CVM ID Schema with validation
 * For extending with additional fields, use CvmIdObjectSchema.extend() then call refineCvmId()
 */
export const CvmIdBaseSchema = refineCvmId(CvmIdObjectSchema);

/**
 * CVM ID Schema - supports multiple identifier formats
 * Automatically transforms to the correct format for API calls
 *
 * @example
 * ```typescript
 * const result1 = CvmIdSchema.parse({ id: "cvm-123" });
 * const result2 = CvmIdSchema.parse({ uuid: "550e8400-e29b-41d4-a716-446655440000" });
 * ```
 */
export const CvmIdSchema = CvmIdBaseSchema.transform((data) => {
  // Priority: id > uuid > app_id > instance_id
  let cvmId: string;

  if (data.id) {
    cvmId = data.id;
  } else if (data.uuid) {
    // Remove dashes from UUID
    cvmId = data.uuid.replace(/-/g, "");
  } else if (data.app_id) {
    // Ensure app_id has 'app_' prefix
    cvmId = data.app_id.startsWith("app_") ? data.app_id : `app_${data.app_id}`;
  } else if (data.instance_id) {
    // Ensure instance_id has 'instance_' prefix
    cvmId = data.instance_id.startsWith("instance_")
      ? data.instance_id
      : `instance_${data.instance_id}`;
  } else {
    throw new Error("No valid identifier provided");
  }

  return { cvmId };
});

/**
 * Input type for CVM ID
 *
 * @example
 * ```typescript
 * const identifier: CvmIdInput = { id: "cvm-123" };
 * const identifier2: CvmIdInput = { uuid: "550e8400-e29b-41d4-a716-446655440000" };
 * ```
 */
export type CvmIdInput = {
  id?: string;
  uuid?: string;
  app_id?: string;
  instance_id?: string;
};
