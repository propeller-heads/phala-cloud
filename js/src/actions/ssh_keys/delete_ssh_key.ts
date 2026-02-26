import { z } from "zod";
import { defineAction } from "../../utils/define-action";

export const DeleteSshKeyRequestSchema = z.object({
  keyId: z.string().min(1),
});

export type DeleteSshKeyRequest = z.infer<typeof DeleteSshKeyRequestSchema>;

/**
 * Delete an SSH key
 *
 * Permanently removes an SSH key from the current user's account.
 * This operation cannot be undone.
 *
 * @example
 * ```typescript
 * import { createClient, deleteSshKey } from '@phala/cloud'
 *
 * const client = createClient({ apiKey: 'your-api-key' })
 * await deleteSshKey(client, { keyId: 'sshkey_xxx' })
 * console.log('Key deleted')
 * ```
 *
 * ## Safe Version
 *
 * ```typescript
 * const result = await safeDeleteSshKey(client, { keyId: 'sshkey_xxx' })
 * if (result.success) {
 *   console.log('Key deleted')
 * } else {
 *   console.error(result.error.message)
 * }
 * ```
 */
const { action: deleteSshKey, safeAction: safeDeleteSshKey } = defineAction<
  DeleteSshKeyRequest,
  z.ZodVoid
>(z.void(), async (client, request) => {
  const { keyId } = DeleteSshKeyRequestSchema.parse(request);
  await client.delete(`/user/ssh-keys/${keyId}`);
  return undefined;
});

export { deleteSshKey, safeDeleteSshKey };
