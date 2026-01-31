import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const logoutCommandMeta: CommandMeta = {
	name: "logout",
	category: "profile",
	description: "Remove stored API key",
	stability: "stable",
};

export const logoutCommandSchema = z.object({});

export type LogoutCommandInput = z.infer<typeof logoutCommandSchema>;
