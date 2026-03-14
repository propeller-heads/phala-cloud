import { envsGroup } from "./command";
import { envsEncryptCommand } from "./encrypt";
import { envsUpdateCommand } from "./update";

export const envsCommands = {
	group: envsGroup,
	commands: [envsEncryptCommand, envsUpdateCommand],
};

export default envsCommands;
