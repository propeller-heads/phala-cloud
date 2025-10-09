import { Command } from "commander";
import { getCommand } from "./get";
import { listCommand } from "./list";
import { setCommand } from "./set";

export const configCommands = new Command()
	.name("config")
	.description("Manage your local configuration")
	.addCommand(getCommand)
	.addCommand(setCommand)
	.addCommand(listCommand);
