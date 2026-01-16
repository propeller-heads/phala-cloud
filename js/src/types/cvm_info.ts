import { z } from "zod";
import { type KmsInfo, KmsInfoSchema } from "./kms_info";

export const VmInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  uptime: z.string(),
  app_url: z.string().nullable(),
  app_id: z.string(),
  instance_id: z.string().nullable(),
  configuration: z.any().optional(), // TODO: add VmConfiguration schema if needed
  exited_at: z.string().nullable(),
  boot_progress: z.string().nullable(),
  boot_error: z.string().nullable(),
  shutdown_progress: z.string().nullable(),
  image_version: z.string().nullable(),
});

export const ManagedUserSchema = z.object({
  id: z.number(),
  username: z.string(),
});

export const CvmNodeSchema = z.object({
  id: z.number(),
  name: z.string(),
  region_identifier: z.string().nullable().optional(),
});

export const MachineInfoSchema = z.object({
  vcpu: z.number(),
  memory: z.number(), // MB
  disk_size: z.number(), // GB
  gpu_count: z.number().default(0),
});

export type MachineInfo = z.infer<typeof MachineInfoSchema>;

export const CvmNetworkUrlsSchema = z.object({
  app: z.string(),
  instance: z.string(),
});

// CVM schema that use in list API.
export const CvmInfoSchema = z.object({
  hosted: VmInfoSchema,
  name: z.string(),
  managed_user: ManagedUserSchema.nullable(),
  node: CvmNodeSchema.nullable(),
  listed: z.boolean().default(false),
  status: z.string(),
  in_progress: z.boolean().default(false),
  dapp_dashboard_url: z.string().nullable(),
  syslog_endpoint: z.string().nullable(),
  allow_upgrade: z.boolean().default(false),
  project_id: z.string().nullable(), // HashedId is represented as string in JS
  project_type: z.string().nullable(),
  billing_period: z.string().nullable(),
  kms_info: KmsInfoSchema.nullable(),
  vcpu: z.number().nullable(),
  memory: z.number().nullable(),
  disk_size: z.number().nullable(),
  gateway_domain: z.string().nullable(),
  public_urls: z.array(CvmNetworkUrlsSchema),
  machine_info: MachineInfoSchema.nullable().optional(),
  updated_at: z.string().nullable().optional(), // datetime serialized as ISO string
});

export type CvmInfo = z.infer<typeof CvmInfoSchema>;

// CVM schema that use in get API.
export const CvmLegacyDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  in_progress: z.boolean().optional().default(false),
  teepod_id: z.number().nullable(),
  teepod: CvmNodeSchema.optional().nullable(),
  app_id: z.string(),
  vm_uuid: z.string().nullable(),
  instance_id: z.string().nullable(),
  vcpu: z.number(),
  memory: z.number(),
  disk_size: z.number(),
  base_image: z.string().nullable(),
  encrypted_env_pubkey: z.string().nullable(),
  listed: z.boolean().optional().default(false),
  project_id: z.string().optional().nullable(),
  project_type: z.string().optional().nullable(),
  instance_type: z.string().optional().nullable(),
  public_sysinfo: z.boolean().optional().default(false),
  public_logs: z.boolean().optional().default(false),
  dapp_dashboard_url: z.string().optional().nullable(),
  syslog_endpoint: z.string().optional().nullable(),
  kms_info: KmsInfoSchema.optional().nullable(),
  contract_address: z.string().optional().nullable(),
  deployer_address: z.string().optional().nullable(),
  scheduled_delete_at: z.string().optional().nullable(),
  public_urls: z.array(CvmNetworkUrlsSchema).optional().default([]),
  gateway_domain: z.string().optional().nullable(),
  machine_info: MachineInfoSchema.optional().nullable(),
  updated_at: z.string().optional().nullable(), // datetime serialized as ISO string
});

export type CvmLegacyDetail = z.infer<typeof CvmLegacyDetailSchema> & { kms_info: KmsInfo };

// VM schema - matches backend's VM model (used by start/stop/shutdown/restart operations)
export const VMSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  teepod_id: z.number(),
  teepod: CvmNodeSchema.optional().nullable(),
  user_id: z.number().optional().nullable(),
  app_id: z.string(),
  vm_uuid: z.string().nullable(),
  instance_id: z.string().nullable(),
  // Deprecated fields - will be removed in next API version
  app_url: z.string().optional().nullable().default(null),
  base_image: z.string().nullable(),
  vcpu: z.number(),
  memory: z.number(),
  disk_size: z.number(),
  manifest_version: z.number().optional().nullable().default(2),
  version: z.string().optional().nullable().default("1.0.0"),
  runner: z.string().optional().nullable().default("docker-compose"),
  docker_compose_file: z.string().optional().nullable(),
  features: z.array(z.string()).optional().nullable().default(["kms", "tproxy-net"]),
  created_at: z.string(), // datetime serialized as ISO string
  encrypted_env_pubkey: z.string().nullable(),
});

export type VM = z.infer<typeof VMSchema>;
