import type { CommandMeta } from "@/src/core/types";
import { commonAuthOptions } from "@/src/core/common-flags";
import {
	debugOption,
	jsonOption,
	statusCommandSchema,
} from "@/src/commands/status/command";

export const authStatusCommandMeta: CommandMeta = {
	name: "status",
	description:
		"[DEPRECATED] Check authentication status (use 'phala status' instead)",
	options: [...commonAuthOptions, jsonOption, debugOption],
};

export const authStatusCommandSchema = statusCommandSchema;
