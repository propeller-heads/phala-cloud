import { configGroup } from "./command";
import { configGetCommand } from "./get";
import { configListCommand } from "./list";
import { configSetCommand } from "./set";

export const configCommands = {
	group: configGroup,
	commands: [configGetCommand, configListCommand, configSetCommand],
};

export default configCommands;
