import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const loginCommandMeta: CommandMeta = {
	name: "login",
	description: "Authenticate with Phala Cloud (use 'phala login' instead)",
	stability: "deprecated",
	arguments: [
		{
			name: "api-key",
			description:
				"API key for authentication (optional, triggers device flow if not provided)",
			required: false,
			target: "apiKey",
		},
	],
	options: [
		{
			name: "manual",
			description: "Manually enter API key instead of using device flow",
			type: "boolean",
		},
		{
			name: "no-open",
			description: "Don't automatically open browser for device flow",
			type: "boolean",
		},
	],
};

export const loginCommandSchema = z.object({
	apiKey: z.string().min(1, "API key cannot be empty").optional(),
	manual: z.boolean().optional(),
	noOpen: z.boolean().optional(),
});

export type LoginCommandInput = z.infer<typeof loginCommandSchema>;
