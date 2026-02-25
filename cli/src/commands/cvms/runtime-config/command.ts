import { z } from "zod";
import { cvmIdArgument, interactiveOption } from "@/src/core/common-flags";
import type { CommandMeta } from "@/src/core/types";

export const cvmsRuntimeConfigCommandMeta: CommandMeta = {
	name: "runtime-config",
	description: "Show the runtime configuration of a CVM",
	stability: "stable",
	category: "cvm-ops",
	arguments: [cvmIdArgument],
	options: [interactiveOption],
	examples: [
		{
			name: "Show runtime config by app_id",
			value: "phala runtime-config app_123",
		},
		{
			name: "Show runtime config by name",
			value: "phala runtime-config my-app",
		},
	],
};

export const cvmsRuntimeConfigCommandSchema = z.object({
	cvmId: z.string().optional(),
});

export type CvmsRuntimeConfigCommandInput = z.infer<
	typeof cvmsRuntimeConfigCommandSchema
>;
