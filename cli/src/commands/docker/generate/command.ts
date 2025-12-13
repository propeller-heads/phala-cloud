import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const dockerGenerateCommandMeta: CommandMeta = {
	name: "generate",
	description: "Generate a Docker Compose file",
	stability: "unstable",
	options: [
		{
			name: "image",
			shorthand: "i",
			description:
				"Docker image name to use in the compose file (e.g. phala/phala-cloud)",
			type: "string",
			target: "image",
		},
		{
			name: "env-file",
			shorthand: "e",
			description: "Path to environment variables file",
			type: "string",
			target: "envFile",
		},
		{
			name: "output",
			shorthand: "o",
			description: "Output path for generated docker-compose.yml",
			type: "string",
			target: "output",
		},
		{
			name: "template",
			description: "Template to use for the generated docker-compose.yml",
			type: "string",
			target: "template",
		},
	],
};

export const dockerGenerateCommandSchema = z.object({
	image: z.string().optional(),
	envFile: z.string().optional(),
	output: z.string().optional(),
	template: z.string().optional(),
});

export type DockerGenerateCommandInput = z.infer<
	typeof dockerGenerateCommandSchema
>;
