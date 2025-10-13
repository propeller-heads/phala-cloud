import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const cvmsListNodesCommandMeta: CommandMeta = {
	name: "list-nodes",
	description: "List all available worker nodes.",
};

export const cvmsListNodesCommandSchema = z.object({});

export type CvmsListNodesCommandInput = z.infer<
	typeof cvmsListNodesCommandSchema
>;
