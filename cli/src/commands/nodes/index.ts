import { nodesGroup } from "./command";
import { nodesCommand, nodesListCommand } from "./list/index";

export const nodesCommands = {
	group: nodesGroup,
	commands: [nodesCommand, nodesListCommand],
};

export default nodesCommands;
