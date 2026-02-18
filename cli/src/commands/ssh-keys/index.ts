import { sshKeysGroup } from "./command";
import { sshKeysImportGithubCommand } from "./import-github";
import { sshKeysListCommand } from "./list";

export const sshKeysCommands = {
	group: sshKeysGroup,
	commands: [sshKeysListCommand, sshKeysImportGithubCommand],
};

export default sshKeysCommands;
