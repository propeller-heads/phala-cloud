import { z } from "zod";

/**
 * Current user schema for API version 2025-10-28 (legacy flat format)
 */
export const CurrentUserV20251028Schema = z
  .object({
    username: z.string(),
    email: z.string(),
    credits: z.number(),
    granted_credits: z.number(),
    avatar: z.string(),
    team_name: z.string(),
    team_tier: z.string(),
  })
  .passthrough();

export type CurrentUserV20251028 = z.infer<typeof CurrentUserV20251028Schema>;
