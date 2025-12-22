import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const dockerPushCommandMeta: CommandMeta = {
	name: "push",
	description: "Push a Docker image to Docker Hub",
	stability: "unstable",
	options: [
		{
			name: "image",
			shorthand: "i",
			description: "Full image name (e.g. username/image:tag)",
			type: "string",
			target: "image",
		},
	],
};

export const dockerPushCommandSchema = z.object({
	image: z.string().optional(),
});

export type DockerPushCommandInput = z.infer<typeof dockerPushCommandSchema>;
