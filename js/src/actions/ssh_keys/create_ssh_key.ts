import { z } from "zod";
import { SshKeySchema, type SshKey } from "./list_ssh_keys";
import { defineAction } from "../../utils/define-action";

export const CreateSshKeyRequestSchema = z.object({
  name: z.string().min(1),
  public_key: z.string().min(1),
});

export type CreateSshKeyRequest = z.infer<typeof CreateSshKeyRequestSchema>;

/**
 * Create a new SSH key for the current user
 *
 * Adds a manually-provided public key. The server computes the SHA256
 * fingerprint and detects the key type automatically.
 *
 * @example
 * ```typescript
 * import { createClient, createSshKey } from '@phala/cloud'
 *
 * const client = createClient({ apiKey: 'your-api-key' })
 * const key = await createSshKey(client, {
 *   name: 'my-laptop',
 *   public_key: 'ssh-ed25519 AAAA...',
 * })
 * console.log(key.fingerprint)
 * ```
 *
 * ## Safe Version
 *
 * ```typescript
 * const result = await safeCreateSshKey(client, {
 *   name: 'my-laptop',
 *   public_key: 'ssh-ed25519 AAAA...',
 * })
 * if (result.success) {
 *   console.log('Created key:', result.data.id)
 * } else {
 *   console.error(result.error.message)
 * }
 * ```
 */
const { action: createSshKey, safeAction: safeCreateSshKey } = defineAction<
  CreateSshKeyRequest,
  typeof SshKeySchema
>(SshKeySchema, async (client, request) => {
  const { name, public_key } = CreateSshKeyRequestSchema.parse(request);
  return await client.post("/user/ssh-keys", { name, public_key });
});

export { createSshKey, safeCreateSshKey };
