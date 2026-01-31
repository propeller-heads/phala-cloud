import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const dockerRunCommandMeta: CommandMeta = {
	name: "run",
	description: "Run a Docker Compose setup",
	stability: "unstable",
	options: [
		{
			name: "compose",
			shorthand: "c",
			description: "Path to docker-compose.yml file",
			type: "string",
			target: "compose",
		},
		{
			name: "env-file",
			shorthand: "e",
			description: "Path to environment variables file",
			type: "string",
			target: "envFile",
		},
		{
			name: "skip-env",
			description: "Skip env file prompt",
			type: "boolean",
			target: "skipEnv",
		},
	],
};

export const dockerRunCommandSchema = z.object({
	compose: z.string().optional(),
	envFile: z.string().optional(),
	skipEnv: z.boolean().default(true),
});

export type DockerRunCommandInput = z.infer<typeof dockerRunCommandSchema>;
