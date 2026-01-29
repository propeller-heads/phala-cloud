import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const loginCommandMeta: CommandMeta = {
	name: "login",
	description: "Authenticate with Phala Cloud",
	stability: "stable",
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
			target: "noOpen",
		},
		{
			name: "profile",
			description:
				"Save credentials to a named profile (defaults to current workspace name)",
			type: "string",
			target: "profile",
		},
		{
			name: "print-token",
			description:
				"Print the token to stdout (machine-readable) and do not save it",
			type: "boolean",
			target: "printToken",
		},
	],
};

export const loginCommandSchema = z.object({
	apiKey: z.string().min(1, "API key cannot be empty").optional(),
	manual: z.boolean().optional(),
	noOpen: z.boolean().optional(),
	profile: z.string().min(1).optional(),
	printToken: z.boolean().optional(),
});

export type LoginCommandInput = z.infer<typeof loginCommandSchema>;
