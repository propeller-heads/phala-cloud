import { z } from "zod";
import { cvmIdArgument } from "@/src/core/common-flags";
import type { CommandMeta } from "@/src/core/types";

export const cvmsRuntimeConfigCommandMeta: CommandMeta = {
	name: "runtime-config",
	description: "Show the runtime configuration of a CVM",
	stability: "stable",
	arguments: [cvmIdArgument],
	examples: [
		{
			name: "Show runtime config by app_id",
			value: "phala cvms runtime-config app_123",
		},
		{
			name: "Show runtime config by name",
			value: "phala cvms runtime-config my-app",
		},
	],
};

export const cvmsRuntimeConfigCommandSchema = z.object({
	cvmId: z.string().optional(),
});

export type CvmsRuntimeConfigCommandInput = z.infer<
	typeof cvmsRuntimeConfigCommandSchema
>;
