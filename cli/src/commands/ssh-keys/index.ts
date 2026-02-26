import { sshKeysAddCommand } from "./add";
import { sshKeysGroup } from "./command";
import { sshKeysImportGithubCommand } from "./import-github";
import { sshKeysListCommand } from "./list";
import { sshKeysRemoveCommand } from "./remove";

export const sshKeysCommands = {
	group: sshKeysGroup,
	commands: [
		sshKeysListCommand,
		sshKeysAddCommand,
		sshKeysRemoveCommand,
		sshKeysImportGithubCommand,
	],
};

export default sshKeysCommands;
