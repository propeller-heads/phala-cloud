import { z } from "zod";

/**
 * Current user schema for API version 2026-01-21 (three-layer structure)
 */

export const UserInfoSchema = z
  .object({
    username: z.string(),
    email: z.string(),
    role: z.enum(["admin", "user"]),
    avatar: z.string(),
    email_verified: z.boolean(),
    totp_enabled: z.boolean(),
    backup_codes_count: z.number(),
    flag_reset_password: z.boolean().nullable().optional(),
    flag_has_password: z.boolean().optional(),
  })
  .passthrough();

export type UserInfo = z.infer<typeof UserInfoSchema>;

export const WorkspaceInfoSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string().nullable(),
    tier: z.string(),
    role: z.string(),
  })
  .passthrough();

export type WorkspaceInfo = z.infer<typeof WorkspaceInfoSchema>;

export const CreditsInfoSchema = z
  .object({
    balance: z.number(),
    granted_balance: z.number(),
    is_post_paid: z.boolean(),
    outstanding_amount: z.number().nullable(),
  })
  .passthrough();

export type CreditsInfo = z.infer<typeof CreditsInfoSchema>;

export const CurrentUserV20260121Schema = z
  .object({
    user: UserInfoSchema,
    workspace: WorkspaceInfoSchema,
    credits: CreditsInfoSchema,
  })
  .passthrough();

export type CurrentUserV20260121 = z.infer<typeof CurrentUserV20260121Schema>;
