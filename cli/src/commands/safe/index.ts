import { safeGroup } from "./command";
import { safeProposeUpdateCommand } from "./propose-update";

export const safeCommands = {
	group: safeGroup,
	commands: [safeProposeUpdateCommand],
};

export default safeCommands;
