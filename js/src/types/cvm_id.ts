import { z } from "zod";
import { isValidHostname } from "../utils/hostname";

/**
 * CVM ID object schema - use this with .extend() to add more fields
 * This schema does NOT include the refine validation, allowing you to extend first
 *
 * @example
 * ```typescript
 * const MySchema = CvmIdObjectSchema.extend({
 *   custom_field: z.string()
 * }).refine(
 *   (data) => !!(data.id || data.uuid || data.app_id || data.instance_id || data.name),
 *   "One of id, uuid, app_id, instance_id, or name must be provided"
 * );
 * ```
 */
export const CvmIdObjectSchema = z.object({
  /** Direct CVM ID (any format) - accepts any string including names */
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
  /** CVM name (RFC 1123 hostname format: 5-63 chars, starts with letter, alphanumeric + hyphens) */
  name: z
    .string()
    .refine(isValidHostname, {
      message:
        "Name must be 5-63 characters, start with letter, and contain only letters/numbers/hyphens",
    })
    .optional(),
});

/**
 * Helper function to add CVM ID validation refine to any schema
 */
export const refineCvmId = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine(
    (data: unknown) => {
      const obj = data as {
        id?: string;
        uuid?: string;
        app_id?: string;
        instance_id?: string;
        name?: string;
      };
      return !!(obj.id || obj.uuid || obj.app_id || obj.instance_id || obj.name);
    },
    {
      message: "One of id, uuid, app_id, instance_id, or name must be provided",
    },
  );

/**
 * Base CVM ID Schema with validation
 * For extending with additional fields, use CvmIdObjectSchema.extend() then call refineCvmId()
 */
export const CvmIdBaseSchema = refineCvmId(CvmIdObjectSchema);

/**
 * CVM ID Schema - supports multiple identifier formats
 * Automatically detects and normalizes any CVM ID format
 *
 * Process:
 * 1. Extract raw value from any field (priority: id > uuid > app_id > instance_id > name)
 * 2. Auto-detect format using regex patterns
 * 3. Apply appropriate normalization:
 *    - UUID (with or without dashes) → remove dashes
 *    - 40-char hex string → add 'app_' prefix
 *    - Name field → use as-is (validated by RFC 1123)
 *    - Already prefixed or custom → use as-is
 *
 * @example
 * ```typescript
 * // UUID formats
 * CvmIdSchema.parse({ id: "550e8400-e29b-41d4-a716-446655440000" });
 * CvmIdSchema.parse({ uuid: "550e8400-e29b-41d4-a716-446655440000" });
 * // → { cvmId: "550e8400e29b41d4a716446655440000" }
 *
 * // App ID formats
 * CvmIdSchema.parse({ id: "50b0e827cc6c53f4010b57e588a18c5ef9388cc1" });
 * CvmIdSchema.parse({ app_id: "50b0e827cc6c53f4010b57e588a18c5ef9388cc1" });
 * // → { cvmId: "app_50b0e827cc6c53f4010b57e588a18c5ef9388cc1" }
 *
 * // Name formats (RFC 1123)
 * CvmIdSchema.parse({ name: "my-app" });
 * CvmIdSchema.parse({ id: "my-app" });  // also works via id field
 * // → { cvmId: "my-app" }
 * ```
 */
export const CvmIdSchema = CvmIdBaseSchema.transform((data) => {
  // Step 1: Extract raw value from any field (priority: id > uuid > app_id > instance_id > name)
  let rawValue: string;

  if (data.id) {
    rawValue = data.id;
  } else if (data.uuid) {
    rawValue = data.uuid;
  } else if (data.app_id) {
    rawValue = data.app_id;
  } else if (data.instance_id) {
    rawValue = data.instance_id;
  } else if (data.name) {
    // Name field: use as-is, no format conversion
    // Backend will auto-detect via is_known_identifier_format()
    return { cvmId: data.name };
  } else {
    throw new Error("No valid identifier provided");
  }

  // Step 2: Define regex patterns for auto-detection
  // UUID format (with or without dashes) - RFC 4122 version 4
  const uuidRegex =
    /^[0-9a-f]{8}[-]?[0-9a-f]{4}[-]?4[0-9a-f]{3}[-]?[89ab][0-9a-f]{3}[-]?[0-9a-f]{12}$/i;
  // 40-char hex string (unprefixed app_id)
  const appIdRegex = /^[0-9a-f]{40}$/i;

  // Step 3: Apply regex-based auto-correction
  let cvmId: string;

  if (uuidRegex.test(rawValue)) {
    // Detected as UUID - remove dashes
    cvmId = rawValue.replace(/-/g, "");
  } else if (appIdRegex.test(rawValue)) {
    // Detected as unprefixed app_id - add 'app_' prefix
    cvmId = `app_${rawValue}`;
  } else {
    // Use as-is (already prefixed like app_xxx, instance_xxx, name via id field, or custom format)
    cvmId = rawValue;
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
 * const identifier3: CvmIdInput = { name: "my-app" };
 * ```
 */
export type CvmIdInput = {
  id?: string;
  uuid?: string;
  app_id?: string;
  instance_id?: string;
  name?: string;
};
