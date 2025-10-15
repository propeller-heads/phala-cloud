import { z } from "zod";

export const LooseAppComposeSchema = z
  .object({
    allowed_envs: z.array(z.string()).optional(),
    docker_compose_file: z.string(),
    features: z.array(z.string()).optional(),
    name: z.string().optional(),
    manifest_version: z.number().optional(),
    kms_enabled: z.boolean().optional(),
    public_logs: z.boolean().optional(),
    public_sysinfo: z.boolean().optional(),
    tproxy_enabled: z.boolean().optional(),
    pre_launch_script: z.string().optional(),
    env_pubkey: z.string().optional(),
    salt: z.string().optional().nullable(),
  })
  .passthrough();

export type LooseAppCompose = z.infer<typeof LooseAppComposeSchema>;
