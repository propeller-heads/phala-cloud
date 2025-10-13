import { authGroup } from "./command";
import { loginCommand } from "./login";
import { logoutCommand } from "./logout";
import { authStatusCommand } from "./status";

export const authCommands = {
	group: authGroup,
	commands: [loginCommand, logoutCommand, authStatusCommand],
};

export default authCommands;
