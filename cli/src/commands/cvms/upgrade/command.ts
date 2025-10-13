import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const cvmsUpgradeCommandMeta: CommandMeta = {
	name: "upgrade",
	description:
		'[DEPRECATED] Upgrade a CVM to a new version (use "phala deploy" instead)',
	arguments: [
		{
			name: "app-id",
			description: "CVM app ID to upgrade (optional)",
			required: false,
			target: "appId",
		},
	],
	options: [
		{
			name: "compose",
			shorthand: "c",
			description: "Path to new Docker Compose file",
			type: "string",
			target: "compose",
		},
		{
			name: "env-file",
			shorthand: "e",
			description: "Path to environment file",
			type: "string",
			target: "envFile",
		},
		{
			name: "debug",
			description: "Enable debug mode",
			type: "boolean",
			target: "debug",
		},
	],
	examples: [
		{
			name: "Upgrade a CVM interactively",
			value: "phala cvms upgrade",
		},
		{
			name: "Upgrade using a compose file",
			value: "phala cvms upgrade app_123 --compose ./docker-compose.yml",
		},
	],
};

export const cvmsUpgradeCommandSchema = z.object({
	appId: z.string().optional(),
	compose: z.string().optional(),
	envFile: z.string().optional(),
	debug: z.boolean().default(false),
});

export type CvmsUpgradeCommandInput = z.infer<typeof cvmsUpgradeCommandSchema>;
