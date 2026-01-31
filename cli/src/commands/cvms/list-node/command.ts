import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const cvmsListNodesCommandMeta: CommandMeta = {
	name: "list-nodes",
	description: "List worker nodes",
	stability: "unstable",
};

export const cvmsListNodesCommandSchema = z.object({});

export type CvmsListNodesCommandInput = z.infer<
	typeof cvmsListNodesCommandSchema
>;
