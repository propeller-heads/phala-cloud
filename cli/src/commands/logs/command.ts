import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { cvmIdOption, interactiveOption } from "@/src/core/common-flags";
import { jsonOption } from "@/src/commands/status/command";

export const logsCommandMeta: CommandMeta = {
	name: "logs",
	category: "cvm-ops",
	description: "Fetch container logs from a CVM",
	stability: "unstable",
	arguments: [
		{
			name: "container-name",
			description: "Container name to fetch logs from",
			required: true,
			target: "containerName",
		},
	],
	options: [
		{
			name: "tail",
			shorthand: "n",
			description: "Lines from end",
			type: "number",
			target: "tail",
		},
		{
			name: "follow",
			shorthand: "f",
			description: "Stream logs in real-time",
			type: "boolean",
			target: "follow",
		},
		{
			name: "timestamps",
			shorthand: "t",
			description: "Show timestamps",
			type: "boolean",
			target: "timestamps",
		},
		{
			name: "since",
			description:
				"Logs since timestamp (e.g. 2013-01-02T13:23:37Z or 42m)",
			type: "string",
			target: "since",
			argumentName: "since",
		},
		{
			name: "until",
			description:
				"Logs before timestamp (e.g. 2013-01-02T13:23:37Z or 42m)",
			type: "string",
			target: "until",
			argumentName: "until",
		},
		{
			name: "stdout",
			description: "Include stdout (default: true)",
			type: "boolean",
			target: "stdout",
			negatedName: "no-stdout",
		},
		{
			name: "stderr",
			description: "Include stderr and route to stderr",
			type: "boolean",
			target: "stderr",
		},
		cvmIdOption,
		jsonOption,
		interactiveOption,
	],
	examples: [
		{
			name: "Show container logs",
			value: "phala logs my-service",
		},
		{
			name: "Include stderr",
			value: "phala logs my-service --stderr",
		},
		{
			name: "Show only stderr",
			value: "phala logs my-service --no-stdout --stderr",
		},
		{
			name: "Last 100 lines",
			value: "phala logs my-service --tail 100",
		},
		{
			name: "Follow logs",
			value: "phala logs my-service --follow",
		},
		{
			name: "Specify CVM",
			value: "phala logs my-service --cvm-id app_abc123",
		},
		{
			name: "With timestamps",
			value: "phala logs my-service --timestamps",
		},
	],
};

export const logsCommandSchema = z.object({
	containerName: z.string(),
	cvmId: z.string().optional(),
	since: z.string().optional(),
	until: z.string().optional(),
	tail: z.number().optional(),
	follow: z.boolean().default(false),
	timestamps: z.boolean().default(false),
	stdout: z.boolean().default(true),
	stderr: z.boolean().default(false),
	json: z.boolean().default(false),
	interactive: z.boolean().default(false),
});

export type LogsCommandInput = z.infer<typeof logsCommandSchema>;
