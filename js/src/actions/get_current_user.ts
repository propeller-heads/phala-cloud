import { z } from "zod";
import { type Client, type SafeResult } from "../client";
import type { ApiVersion } from "../types/client";
import type { GetCurrentUserResponse } from "../types/version-mappings";
import { CurrentUserV20260121Schema } from "../credentials/current_user_v20260121";
import { CurrentUserV20251028Schema } from "../credentials/current_user_v20251028";

/**
 * Get current user information and validate API token
 *
 * Returns information about the current authenticated user.
 * The response format depends on the API version:
 * - v20260121 (default): Three-layer structure with `user`, `workspace`, and `credits`
 * - v20251028 (legacy): Flat structure with all fields at top level
 *
 * @example
 * ```typescript
 * import { createClient, getCurrentUser } from '@phala/cloud'
 *
 * // Default (v20260121) - three-layer response
 * const client = createClient({ apiKey: 'your-api-key' })
 * const auth = await getCurrentUser(client)
 * console.log(auth.user.username)
 * console.log(auth.workspace.name)
 * console.log(auth.credits.balance)
 *
 * // Legacy (v20251028) - flat response
 * const legacyClient = createClient({ apiKey: 'your-api-key', version: '2025-10-28' })
 * const user = await getCurrentUser(legacyClient)
 * console.log(user.username)
 * console.log(user.team_name)
 * console.log(user.credits) // number
 * ```
 *
 * ## Safe Version
 *
 * Use `safeGetCurrentUser` for error handling without exceptions:
 *
 * ```typescript
 * import { safeGetCurrentUser } from '@phala/cloud'
 *
 * const result = await safeGetCurrentUser(client)
 * if (result.success) {
 *   console.log(result.data.user.username)
 * } else {
 *   if ("isRequestError" in result.error) {
 *     console.error(`HTTP ${result.error.status}: ${result.error.message}`)
 *   } else {
 *     console.error(`Validation error: ${result.error.issues}`)
 *   }
 * }
 * ```
 */

// Re-export schemas and types for backward compatibility
export {
  UserInfoSchema,
  WorkspaceInfoSchema,
  CreditsInfoSchema,
  type UserInfo,
  type WorkspaceInfo,
  type CreditsInfo,
} from "../credentials/current_user_v20260121";

export {
  CurrentUserV20260121Schema as AuthResponseSchema,
  type CurrentUserV20260121 as AuthResponse,
} from "../credentials/current_user_v20260121";

export {
  CurrentUserV20251028Schema as CurrentUserSchema,
  type CurrentUserV20251028 as CurrentUser,
} from "../credentials/current_user_v20251028";

// --- Version-aware schema selection ---

function getSchemaForVersion(version: ApiVersion) {
  return version === "2025-10-28" ? CurrentUserV20251028Schema : CurrentUserV20260121Schema;
}

// --- getCurrentUser ---

export function getCurrentUser<V extends ApiVersion>(
  client: Client<V>,
): Promise<GetCurrentUserResponse<V>>;
export function getCurrentUser<V extends ApiVersion>(
  client: Client<V>,
  parameters: { schema: false },
): Promise<unknown>;
export function getCurrentUser<V extends ApiVersion, T extends z.ZodTypeAny>(
  client: Client<V>,
  parameters: { schema: T },
): Promise<z.infer<T>>;
export async function getCurrentUser<V extends ApiVersion>(
  client: Client<V>,
  parameters?: { schema?: z.ZodTypeAny | false },
): Promise<unknown> {
  const response = await client.get("/auth/me");

  if (parameters?.schema === false) {
    return response;
  }

  const schema = parameters?.schema || getSchemaForVersion(client.config.version);
  return schema.parse(response);
}

// --- safeGetCurrentUser ---

export function safeGetCurrentUser<V extends ApiVersion>(
  client: Client<V>,
): Promise<SafeResult<GetCurrentUserResponse<V>>>;
export function safeGetCurrentUser<V extends ApiVersion>(
  client: Client<V>,
  parameters: { schema: false },
): Promise<SafeResult<unknown>>;
export function safeGetCurrentUser<V extends ApiVersion, T extends z.ZodTypeAny>(
  client: Client<V>,
  parameters: { schema: T },
): Promise<SafeResult<z.infer<T>>>;
export async function safeGetCurrentUser<V extends ApiVersion>(
  client: Client<V>,
  parameters?: { schema?: z.ZodTypeAny | false },
): Promise<SafeResult<unknown>> {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: Implementation needs any for overload dispatch
    const data = await getCurrentUser(client, parameters as any);
    return { success: true, data };
  } catch (error) {
    if (error && typeof error === "object" && ("status" in error || "issues" in error)) {
      return { success: false, error } as SafeResult<unknown>;
    }
    return {
      success: false,
      error: {
        name: "Error",
        message: error instanceof Error ? error.message : String(error),
      },
    } as SafeResult<unknown>;
  }
}
