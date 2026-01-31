import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const loginCommandMeta: CommandMeta = {
	name: "login",
	category: "profile",
	description: "Authenticate with Phala Cloud",
	stability: "stable",
	arguments: [
		{
			name: "api-key",
			description: "API key (triggers device flow if omitted)",
			required: false,
			target: "apiKey",
		},
	],
	options: [
		{
			name: "manual",
			description: "Enter API key manually",
			type: "boolean",
		},
		{
			name: "no-open",
			description: "Skip browser launch",
			type: "boolean",
			target: "noOpen",
		},
		{
			name: "profile",
			description: "Profile name (defaults to workspace name)",
			type: "string",
			target: "profile",
		},
		{
			name: "print-token",
			description: "Print token to stdout without saving",
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
