import { z } from "zod";
import type { CommandMeta } from "@/src/core/types";

export const simulatorStopCommandMeta: CommandMeta = {
	name: "stop",
	description: "Stop the TEE simulator",
};

export const simulatorStopCommandSchema = z.object({});

export type SimulatorStopCommandInput = z.infer<
	typeof simulatorStopCommandSchema
>;
