import { cvmsGroup } from "./command";
import { cvmsAttestationCommand } from "./attestation";
import { cvmsCreateCommand } from "./create";
import { cvmsDeleteCommand } from "./delete";
import { cvmsGetCommand } from "./get";
import { cvmsListCommand } from "./list";
import { cvmsListNodesCommand } from "./list-node";
import { cvmsLogsCommand } from "./logs";
import { cvmsReplicateCommand } from "./replicate";
import { cvmsResizeCommand } from "./resize";
import { cvmsRestartCommand } from "./restart";
import { cvmsRuntimeConfigCommand } from "./runtime-config";
import { cvmsSerialLogsCommand } from "./serial-logs";
import { cvmsStartCommand } from "./start";
import { cvmsStopCommand } from "./stop";
import { cvmsUpgradeCommand } from "./upgrade";

export const cvmsCommands = {
	group: cvmsGroup,
	commands: [
		cvmsAttestationCommand,
		cvmsCreateCommand,
		cvmsDeleteCommand,
		cvmsGetCommand,
		cvmsListCommand,
		cvmsListNodesCommand,
		cvmsLogsCommand,
		cvmsReplicateCommand,
		cvmsResizeCommand,
		cvmsRestartCommand,
		cvmsRuntimeConfigCommand,
		cvmsSerialLogsCommand,
		cvmsStartCommand,
		cvmsStopCommand,
		cvmsUpgradeCommand,
	],
};

export default cvmsCommands;
