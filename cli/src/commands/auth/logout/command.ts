import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const logoutCommandMeta: CommandMeta = {
	name: "logout",
	description: "Remove the stored API key (use 'phala logout' instead)",
	stability: "deprecated",
};

export const logoutCommandSchema = z.object({});

export type LogoutCommandInput = z.infer<typeof logoutCommandSchema>;
