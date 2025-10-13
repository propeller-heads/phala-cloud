import { cvmsGroup } from "./command";
import { cvmsAttestationCommand } from "./attestation";
import { cvmsCreateCommand } from "./create";
import { cvmsDeleteCommand } from "./delete";
import { cvmsGetCommand } from "./get";
import { cvmsListCommand } from "./list";
import { cvmsListNodesCommand } from "./list-node";
import { cvmsReplicateCommand } from "./replicate";
import { cvmsResizeCommand } from "./resize";
import { cvmsRestartCommand } from "./restart";
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
		cvmsReplicateCommand,
		cvmsResizeCommand,
		cvmsRestartCommand,
		cvmsStartCommand,
		cvmsStopCommand,
		cvmsUpgradeCommand,
	],
};

export default cvmsCommands;
