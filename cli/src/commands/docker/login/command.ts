import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const dockerLoginCommandMeta: CommandMeta = {
	name: "login",
	description: "Login to Docker Hub",
	options: [
		{
			name: "username",
			shorthand: "u",
			description: "Docker Hub username",
			type: "string",
			target: "username",
		},
		{
			name: "password",
			shorthand: "p",
			description: "Docker Hub password",
			type: "string",
			target: "password",
		},
		{
			name: "registry",
			shorthand: "r",
			description: "Docker registry URL",
			type: "string",
			target: "registry",
		},
	],
};

export const dockerLoginCommandSchema = z.object({
	username: z.string().optional(),
	password: z.string().optional(),
	registry: z.string().optional(),
});

export type DockerLoginCommandInput = z.infer<typeof dockerLoginCommandSchema>;
