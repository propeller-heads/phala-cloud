import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const nodesListCommandMeta: CommandMeta = {
	name: "list",
	aliases: ["ls"],
	description: "List all available worker nodes",
};

export const nodesListCommandSchema = z.object({});

export type NodesListCommandInput = z.infer<typeof nodesListCommandSchema>;
