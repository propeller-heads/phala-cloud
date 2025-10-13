import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const loginCommandMeta: CommandMeta = {
	name: "login",
	description: "Set the API key for authentication",
	arguments: [
		{
			name: "api-key",
			description: "Phala Cloud API key to set",
			required: false,
			target: "apiKey",
		},
	],
};

export const loginCommandSchema = z.object({
	apiKey: z.string().min(1, "API key cannot be empty").optional(),
});

export type LoginCommandInput = z.infer<typeof loginCommandSchema>;
