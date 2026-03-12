import { kmsGroup } from "./command";
import { kmsCommand, kmsListCommand } from "./list/index";
import { kmsEthereumCommand, kmsBaseCommand } from "./chain/index";

export const kmsCommands = {
	group: kmsGroup,
	commands: [kmsCommand, kmsListCommand, kmsEthereumCommand, kmsBaseCommand],
};

export default kmsCommands;
