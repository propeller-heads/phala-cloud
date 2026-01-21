/**
 * CVM internal models (not versioned API responses)
 */

import { z } from "zod";

/**
 * VM schema - matches backend's VM model
 * Used by start/stop/shutdown/restart operations
 * This is an internal model, not a versioned API response
 */
export const VMSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  teepod_id: z.number(),
  teepod: z
    .object({
      id: z.number(),
      name: z.string(),
      region_identifier: z.string().nullable().optional(),
    })
    .optional()
    .nullable(),
  user_id: z.number().optional().nullable(),
  app_id: z.string(),
  vm_uuid: z.string().nullable(),
  instance_id: z.string().nullable(),
  app_url: z.string().optional().nullable(),
  base_image: z.string().nullable(),
  vcpu: z.number(),
  memory: z.number(),
  disk_size: z.number(),
  manifest_version: z.number().optional().nullable(),
  version: z.string().optional().nullable(),
  runner: z.string().optional().nullable(),
  docker_compose_file: z.string().optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  created_at: z.string(),
  encrypted_env_pubkey: z.string().nullable(),
});

export type VM = z.infer<typeof VMSchema>;
