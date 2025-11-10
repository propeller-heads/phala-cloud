import chalk from "chalk";
import { checkCvmExists, getCvmAttestation, selectCvm } from "@/src/api/cvms";
import type { CvmAttestationResponse } from "@/src/api/types";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { logDetailedError } from "@/src/utils/error-handling";
import { logger } from "@/src/utils/logger";
import {
	cvmsAttestationCommandMeta,
	cvmsAttestationCommandSchema,
	type CvmsAttestationCommandInput,
} from "./command";

async function resolveAppId(
	appId?: string,
	silent = false,
): Promise<string | undefined> {
	if (!appId) {
		if (!silent) {
			logger.info("No CVM specified, fetching available CVMs...");
		}
		const selected = await selectCvm();
		return selected ?? undefined;
	}
	return checkCvmExists(appId, silent);
}

async function runCvmsAttestationCommand(
	input: CvmsAttestationCommandInput,
	context: CommandContext,
): Promise<number> {
	try {
		const resolvedAppId = await resolveAppId(input.appId, input.json);

		if (!resolvedAppId) {
			return 0;
		}

		// Don't show spinner in JSON mode to avoid contaminating stdout
		const spinner = input.json
			? null
			: logger.startSpinner(
					`Fetching attestation information for CVM app_${resolvedAppId}...`,
				);

		try {
			const attestationData: CvmAttestationResponse =
				await getCvmAttestation(resolvedAppId);
			spinner?.stop(true);

			if (!attestationData || Object.keys(attestationData).length === 0) {
				logger.info("No attestation information found");
				return 0;
			}

			if (input.json) {
				context.stdout.write(`${JSON.stringify(attestationData, null, 2)}
`);
				return 0;
			}

			logger.success("Attestation Summary:");
			logger.keyValueTable(
				{
					Status: attestationData.is_online
						? chalk.green("Online")
						: chalk.red("Offline"),
					"Public Access": attestationData.is_public
						? chalk.green("Enabled")
						: chalk.yellow("Disabled"),
					Error: attestationData.error || "None",
					Certificates: `${attestationData.app_certificates?.length || 0} found`,
				},
				{ borderStyle: "rounded" },
			);

			if (attestationData.app_certificates?.length) {
				attestationData.app_certificates.forEach((cert, index) => {
					logger.break();
					logger.success(
						`Certificate #${index + 1} (${cert.position_in_chain === 0 ? "End Entity" : "CA"}):`,
					);

					logger.keyValueTable(
						{
							Subject: `${cert.subject.common_name || "Unknown"}${cert.subject.organization ? ` (${cert.subject.organization})` : ""}`,
							Issuer: `${cert.issuer.common_name || "Unknown"}${cert.issuer.organization ? ` (${cert.issuer.organization})` : ""}`,
							"Serial Number": cert.serial_number,
							Validity: `${new Date(cert.not_before).toLocaleString()} to ${new Date(cert.not_after).toLocaleString()}`,
							Fingerprint: cert.fingerprint,
							"Signature Algorithm": cert.signature_algorithm,
							"Is CA": cert.is_ca ? "Yes" : "No",
							"Position in Chain": cert.position_in_chain,
						},
						{ borderStyle: "rounded" },
					);
				});
			}

			if (attestationData.tcb_info) {
				logger.break();
				logger.success("Trusted Computing Base (TCB) Information:");
				logger.keyValueTable(
					{
						Mrtd: attestationData.tcb_info.mrtd,
						"Rootfs Hash": attestationData.tcb_info.rootfs_hash,
						Rtmr0: attestationData.tcb_info.rtmr0,
						Rtmr1: attestationData.tcb_info.rtmr1,
						Rtmr2: attestationData.tcb_info.rtmr2,
						Rtmr3: attestationData.tcb_info.rtmr3,
						"Event Log Entries": `${attestationData.tcb_info.event_log.length} entries`,
					},
					{ borderStyle: "rounded" },
				);

				if (attestationData.tcb_info.event_log?.length) {
					logger.break();
					logger.success("Event Log (Showing entries to reproduce RTMR3):");
					const entries = attestationData.tcb_info.event_log
						.filter((entry) => entry.event)
						.map((entry) => ({
							Event: entry.event,
							IMR: entry.imr.toString(),
							"Event Type": entry.event_type.toString(),
							Payload: entry.event_payload,
						}));

					logger.table(entries, [
						{ key: "Event", header: "Event" },
						{ key: "IMR", header: "IMR" },
						{ key: "Event Type", header: "Type" },
						{ key: "Payload", header: "Payload" },
					]);

					if (attestationData.tcb_info.event_log.length > entries.length) {
						logger.info("To see all full attestation data, use --json");
					}
					logger.break();
					logger.success(
						"To reproduce RTMR3, use the tool at https://rtmr3-calculator.vercel.app/",
					);
				}
			}

			return 0;
		} catch (error) {
			spinner?.stop(false);
			throw error;
		}
	} catch (error) {
		logger.error("Failed to get attestation information");
		logDetailedError(error);
		return 1;
	}
}

export const cvmsAttestationCommand = defineCommand({
	path: ["cvms", "attestation"],
	meta: cvmsAttestationCommandMeta,
	schema: cvmsAttestationCommandSchema,
	handler: runCvmsAttestationCommand,
});

export default cvmsAttestationCommand;
