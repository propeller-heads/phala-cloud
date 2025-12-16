import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const simulatorStartCommandMeta: CommandMeta = {
	name: "start",
	description: "Start the TEE simulator",
	stability: "unstable",
	options: [
		{
			name: "port",
			shorthand: "p",
			description: "Simulator port (default: 8090)",
			type: "string",
			target: "port",
		},
		{
			name: "verbose",
			shorthand: "v",
			description: "Enable verbose output",
			type: "boolean",
			target: "verbose",
		},
	],
};

export const simulatorStartCommandSchema = z.object({
	port: z.string().default("8090"),
	verbose: z.boolean().default(false),
});

export type SimulatorStartCommandInput = z.infer<
	typeof simulatorStartCommandSchema
>;
