import { z } from "zod";
import { CvmIdSchema, type CvmIdInput } from "../../types/cvm_id";
import { defineAction } from "../../utils/define-action";

/**
 * Get CVM attestation and TEE security information
 *
 * This action retrieves detailed attestation information including
 * certificates, TCB info, and measurement values for a CVM instance.
 *
 * @example
 * ```typescript
 * import { createClient, getCvmAttestation } from '@phala/cloud'
 *
 * const client = createClient();
 * const attestation = await getCvmAttestation(client, { id: 'my-cvm-id' });
 * console.log(attestation.tcb_info?.mrtd);
 * ```
 */

const CertificateSubjectSchema = z.object({
  common_name: z.string().nullable(),
  organization: z.string().nullable(),
  country: z.string().nullable(),
  state: z.string().nullable(),
  locality: z.string().nullable(),
});

const CertificateIssuerSchema = z.object({
  common_name: z.string().nullable(),
  organization: z.string().nullable(),
  country: z.string().nullable(),
});

const CertificateSchema = z.object({
  subject: CertificateSubjectSchema,
  issuer: CertificateIssuerSchema,
  serial_number: z.string(),
  not_before: z.string(), // datetime serialized as ISO string
  not_after: z.string(), // datetime serialized as ISO string
  version: z.string(),
  fingerprint: z.string(),
  signature_algorithm: z.string(),
  sans: z.array(z.string()).nullable(),
  is_ca: z.boolean(),
  position_in_chain: z.number().nullable(),
  quote: z.string().nullable(),
  app_id: z.string().nullable().optional(),
  cert_usage: z.string().nullable().optional(),
});

const EventLogSchema = z.object({
  imr: z.number(),
  event_type: z.number(),
  digest: z.string(),
  event: z.string(),
  event_payload: z.string(),
});

const TcbInfoSchema = z.object({
  mrtd: z.string(),
  rootfs_hash: z.string().nullable().optional(),
  rtmr0: z.string(),
  rtmr1: z.string(),
  rtmr2: z.string(),
  rtmr3: z.string(),
  event_log: z.array(EventLogSchema),
  app_compose: z.string(),
});

export const CvmAttestationSchema = z.object({
  name: z.string().nullable(),
  is_online: z.boolean(),
  is_public: z.boolean().default(true),
  error: z.string().nullable(),
  app_certificates: z.array(CertificateSchema).nullable(),
  tcb_info: TcbInfoSchema.nullable(),
  compose_file: z.string().nullable(),
});

export type CvmAttestation = z.infer<typeof CvmAttestationSchema>;

export const GetCvmAttestationRequestSchema = CvmIdSchema;

export type GetCvmAttestationRequest = CvmIdInput;

const { action: getCvmAttestation, safeAction: safeGetCvmAttestation } = defineAction<
  GetCvmAttestationRequest,
  typeof CvmAttestationSchema
>(CvmAttestationSchema, async (client, request) => {
  const { cvmId } = GetCvmAttestationRequestSchema.parse(request);
  return await client.get(`/cvms/${cvmId}/attestation`);
});

export { getCvmAttestation, safeGetCvmAttestation };
