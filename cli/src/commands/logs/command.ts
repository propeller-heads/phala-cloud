import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";
import { cvmIdOption, interactiveOption } from "@/src/core/common-flags";
import { jsonOption } from "@/src/commands/status/command";

export const logsCommandMeta: CommandMeta = {
	name: "logs",
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
			description: "Number of lines to show from the end of the logs",
			type: "number",
			target: "tail",
		},
		{
			name: "follow",
			shorthand: "f",
			description: "Follow log output (stream logs in real-time)",
			type: "boolean",
			target: "follow",
		},
		{
			name: "timestamps",
			shorthand: "t",
			description: "Show timestamps with log entries",
			type: "boolean",
			target: "timestamps",
		},
		{
			name: "since",
			description:
				"Show logs since timestamp (e.g. 2013-01-02T13:23:37Z) or relative (e.g. 42m)",
			type: "string",
			target: "since",
			argumentName: "since",
		},
		{
			name: "until",
			description:
				"Show logs before a timestamp (e.g. 2013-01-02T13:23:37Z) or relative (e.g. 42m)",
			type: "string",
			target: "until",
			argumentName: "until",
		},
		{
			name: "stdout",
			description:
				"Include stdout logs (default: true). Use --no-stdout to disable.",
			type: "boolean",
			target: "stdout",
			negatedName: "no-stdout",
		},
		{
			name: "stderr",
			description:
				"Include stderr logs and route them to stderr. Default: stderr is not shown.",
			type: "boolean",
			target: "stderr",
		},
		cvmIdOption,
		jsonOption,
		interactiveOption,
	],
	examples: [
		{
			name: "Show stdout logs for a container (uses cvm_id from phala.toml)",
			value: "phala logs my-service",
		},
		{
			name: "Include stderr logs (routed to stderr)",
			value: "phala logs my-service --stderr",
		},
		{
			name: "Show only stderr logs",
			value: "phala logs my-service --no-stdout --stderr",
		},
		{
			name: "Show last 100 lines of logs",
			value: "phala logs my-service --tail 100",
		},
		{
			name: "Follow logs in real-time",
			value: "phala logs my-service --follow",
		},
		{
			name: "Specify CVM explicitly",
			value: "phala logs my-service --cvm-id app_abc123",
		},
		{
			name: "Show logs with timestamps",
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
