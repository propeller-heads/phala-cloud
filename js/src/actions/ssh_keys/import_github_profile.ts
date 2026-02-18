import { z } from "zod";
import { defineAction } from "../../utils/define-action";

export const ImportGithubProfileRequestSchema = z.object({
  github_username: z.string().min(1),
});

export type ImportGithubProfileRequest = z.infer<typeof ImportGithubProfileRequestSchema>;

export const ImportGithubProfileResponseSchema = z.object({
  github_username: z.string(),
  keys_added: z.number().int(),
  keys_skipped: z.number().int(),
  errors: z.array(z.string()).default([]),
});

export type ImportGithubProfileResponse = z.infer<typeof ImportGithubProfileResponseSchema>;

/**
 * Import SSH keys from a GitHub user's public profile
 *
 * Fetches public SSH keys from any GitHub user's profile via the unauthenticated
 * GitHub API. Keys already present (matched by SHA256 fingerprint) are skipped.
 * Per-key parse errors are collected in `errors` rather than aborting the import.
 *
 * @example
 * ```typescript
 * import { createClient, importGithubProfileSshKeys } from '@phala/cloud'
 *
 * const client = createClient({ apiKey: 'your-api-key' })
 * const result = await importGithubProfileSshKeys(client, { github_username: 'octocat' })
 * console.log(`Added: ${result.keys_added}, Skipped: ${result.keys_skipped}`)
 * ```
 *
 * ## Safe Version
 *
 * ```typescript
 * const result = await safeImportGithubProfileSshKeys(client, { github_username: 'octocat' })
 * if (result.success) {
 *   console.log('Added', result.data.keys_added, 'key(s)')
 * } else {
 *   console.error(result.error.message)
 * }
 * ```
 */
const { action: importGithubProfileSshKeys, safeAction: safeImportGithubProfileSshKeys } =
  defineAction<ImportGithubProfileRequest, typeof ImportGithubProfileResponseSchema>(
    ImportGithubProfileResponseSchema,
    async (client, request) => {
      const { github_username } = ImportGithubProfileRequestSchema.parse(request);
      return await client.post("/user/ssh-keys/github-profile", { github_username });
    },
  );

export { importGithubProfileSshKeys, safeImportGithubProfileSshKeys };
