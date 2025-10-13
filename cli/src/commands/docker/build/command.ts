import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const dockerBuildCommandMeta: CommandMeta = {
	name: "build",
	description: "Build a Docker image",
	options: [
		{
			name: "image",
			shorthand: "i",
			description: "Image name",
			type: "string",
			target: "image",
		},
		{
			name: "tag",
			shorthand: "t",
			description: "Image tag",
			type: "string",
			target: "tag",
		},
		{
			name: "file",
			shorthand: "f",
			description: "Path to Dockerfile",
			type: "string",
			target: "file",
		},
	],
	examples: [
		{
			name: "Build docker image with prompts",
			value: "phala docker build",
		},
		{
			name: "Build docker image with options",
			value: "phala docker build --image myapp --tag latest",
		},
	],
};

export const dockerBuildCommandSchema = z.object({
	image: z.string().optional(),
	tag: z.string().optional(),
	file: z.string().default("Dockerfile"),
});

export type DockerBuildCommandInput = z.infer<typeof dockerBuildCommandSchema>;
