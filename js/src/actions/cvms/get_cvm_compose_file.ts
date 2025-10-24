import { z } from "zod";
import { type Client } from "../../client";
import { LooseAppComposeSchema } from "../../types/app_compose";
import { defineAction } from "../../utils/define-action";
import { CvmIdSchema, type CvmIdInput } from "../../types/cvm_id";
import { withComposeMethods } from "../../utils/get_compose_hash";

/**
 * Get CVM compose file configuration
 *
 * Retrieves the current Docker Compose file configuration and metadata for a specified CVM.
 *
 * @example
 * ```typescript
 * import { createClient, getCvmComposeFile } from '@phala/cloud'
 *
 * const client = createClient({ apiKey: 'your-api-key' })
 * const composeFile = await getCvmComposeFile(client, { id: 'cvm-123' })
 * // Output: { compose_content: '...', version: '...', last_modified: '...' }
 * ```
 *
 * ## Returns
 *
 * `GetCvmComposeFileResult | unknown`
 *
 * The CVM compose file configuration including compose_content and metadata. Return type depends on schema parameter.
 *
 * ## Parameters
 *
 * ### request (required)
 * - **Type:** `GetCvmComposeFileRequest`
 *
 * Request parameters containing the CVM identifier. Can be one of:
 * - id: The CVM ID
 * - uuid: The CVM UUID
 * - appId: The App ID (40 chars)
 * - instanceId: The Instance ID (40 chars)
 *
 * ### parameters (optional)
 * - **Type:** `GetCvmComposeFileParameters`
 *
 * Optional behavior parameters for schema validation.
 *
 * ```typescript
 * // Use default schema
 * const result = await getCvmComposeFile(client, { id: 'cvm-123' })
 *
 * // Return raw data without validation
 * const raw = await getCvmComposeFile(client, { id: 'cvm-123' }, { schema: false })
 *
 * // Use custom schema
 * const customSchema = z.object({ compose_content: z.string() })
 * const custom = await getCvmComposeFile(client, { id: 'cvm-123' }, { schema: customSchema })
 * ```
 *
 * ## Safe Version
 *
 * Use `safeGetCvmComposeFile` for error handling without exceptions:
 *
 * ```typescript
 * import { safeGetCvmComposeFile } from '@phala/cloud'
 *
 * const result = await safeGetCvmComposeFile(client, { id: 'cvm-123' })
 * if (result.success) {
 *   console.log(result.data.compose_content)
 * } else {
 *   if ("isRequestError" in result.error) {
 *     console.error(`HTTP ${result.error.status}: ${result.error.message}`)
 *   } else {
 *     console.error(`Validation error: ${result.error.issues}`)
 *   }
 * }
 * ```
 */

// Transform schema to add utility methods to the result
export const GetCvmComposeFileResultSchema = LooseAppComposeSchema.transform((data) =>
  withComposeMethods(data),
);

// Legacy alias for backwards compatibility
export const CvmComposeFileSchema = GetCvmComposeFileResultSchema;
export type CvmComposeFile = z.infer<typeof CvmComposeFileSchema>;
export type GetCvmComposeFileResult = z.infer<typeof GetCvmComposeFileResultSchema>;

export const GetCvmComposeFileRequestSchema = CvmIdSchema;

export type GetCvmComposeFileRequest = CvmIdInput;

const { action: getCvmComposeFile, safeAction: safeGetCvmComposeFile } = defineAction<
  GetCvmComposeFileRequest,
  typeof GetCvmComposeFileResultSchema
>(GetCvmComposeFileResultSchema, async (client, request) => {
  const { cvmId } = GetCvmComposeFileRequestSchema.parse(request);
  return await client.get(`/cvms/${cvmId}/compose_file`);
});

export { getCvmComposeFile, safeGetCvmComposeFile };
