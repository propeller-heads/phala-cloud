import { z } from "zod";
import {
	getSimulatorEndpoint,
	getSimulatorPid,
	isSimulatorRunning,
} from "@/src/utils/simulator";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext, CommandMeta } from "@/src/core/types";
import { simulatorGroup } from "./command";
import { simulatorStartCommand } from "./start";
import { simulatorStopCommand } from "./stop";

const simulatorRootMeta: CommandMeta = {
	name: "simulator",
	description: "TEE simulator commands",
	stability: "unstable",
};

const simulatorStatusSchema = z.object({});

async function runSimulatorStatus(
	_input: z.infer<typeof simulatorStatusSchema>,
	context: CommandContext,
): Promise<number> {
	try {
		const isRunning = await isSimulatorRunning();
		const pid = getSimulatorPid();

		if (isRunning && pid) {
			const endpoint = getSimulatorEndpoint();
			const dstackEndpoint = endpoint;
			const tappdEndpoint = dstackEndpoint.replace(
				/dstack\.sock$/,
				"tappd.sock",
			);

			context.stdout.write(`✓ TEE simulator is running (PID: ${pid})\\n`);
			context.stdout.write(
				"\nSet these environment variables to use the simulator:\n",
			);
			context.stdout.write(
				`  export DSTACK_SIMULATOR_ENDPOINT=${dstackEndpoint}\\n`,
			);
			context.stdout.write(
				`  export TAPPD_SIMULATOR_ENDPOINT=${tappdEndpoint}\\n`,
			);
		} else {
			context.stdout.write("TEE simulator is not running\\n\n");
			context.stdout.write("To start the simulator, run:\n");
			context.stdout.write("  phala simulator start\\n");
		}

		return 0;
	} catch (error) {
		context.stderr.write(
			`Error checking simulator status: ${error instanceof Error ? error.message : String(error)}\\n`,
		);
		return 1;
	}
}

export const simulatorRootCommand = defineCommand({
	path: ["simulator"],
	meta: simulatorRootMeta,
	schema: simulatorStatusSchema,
	handler: runSimulatorStatus,
});

export const simulatorCommands = {
	group: simulatorGroup,
	commands: [simulatorRootCommand, simulatorStartCommand, simulatorStopCommand],
};

export default simulatorCommands;
