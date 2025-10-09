import { Command } from "commander";
import { attestationCommand } from "./attestation";
import { createCommand } from "./create";
import { deleteCommand } from "./delete";
import { getCommand } from "./get";
import { listCommand } from "./list";
import { listNodesCommand } from "./list-node";
import { replicateCommand } from "./replicate";
import { resizeCommand } from "./resize";
import { restartCommand } from "./restart";
import { startCommand } from "./start";
import { stopCommand } from "./stop";
import { upgradeCommand } from "./upgrade";

export const cvmsCommand = new Command()
	.name("cvms")
	.description("Manage Phala Confidential Virtual Machines (CVMs)")
	.addCommand(attestationCommand)
	.addCommand(createCommand)
	.addCommand(deleteCommand)
	.addCommand(getCommand)
	.addCommand(listCommand)
	.addCommand(startCommand)
	.addCommand(stopCommand)
	.addCommand(resizeCommand)
	.addCommand(restartCommand)
	.addCommand(upgradeCommand)
	.addCommand(listNodesCommand)
	.addCommand(replicateCommand);
