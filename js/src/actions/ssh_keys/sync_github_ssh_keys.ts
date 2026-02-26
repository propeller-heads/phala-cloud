import { z } from "zod";
import { defineSimpleAction } from "../../utils/define-action";

export const SyncGithubSshKeysResponseSchema = z.object({
  synced_count: z.number().int(),
  keys_added: z.number().int(),
  keys_updated: z.number().int(),
  keys_removed: z.number().int(),
  errors: z.array(z.string()).default([]),
});

export type SyncGithubSshKeysResponse = z.infer<typeof SyncGithubSshKeysResponseSchema>;

/**
 * Sync SSH keys from the user's linked GitHub account
 *
 * Fetches SSH keys from the authenticated user's linked GitHub account and
 * synchronises them. New keys are added, existing keys are updated, and
 * keys removed from GitHub are revoked locally.
 *
 * @example
 * ```typescript
 * import { createClient, syncGithubSshKeys } from '@phala/cloud'
 *
 * const client = createClient({ apiKey: 'your-api-key' })
 * const result = await syncGithubSshKeys(client)
 * console.log(`Added: ${result.keys_added}, Removed: ${result.keys_removed}`)
 * ```
 *
 * ## Safe Version
 *
 * ```typescript
 * const result = await safeSyncGithubSshKeys(client)
 * if (result.success) {
 *   console.log('Synced', result.data.synced_count, 'key(s)')
 * } else {
 *   console.error(result.error.message)
 * }
 * ```
 */
const { action: syncGithubSshKeys, safeAction: safeSyncGithubSshKeys } = defineSimpleAction(
  SyncGithubSshKeysResponseSchema,
  async (client) => {
    return await client.post("/user/ssh-keys/github-sync", {});
  },
);

export { syncGithubSshKeys, safeSyncGithubSshKeys };
