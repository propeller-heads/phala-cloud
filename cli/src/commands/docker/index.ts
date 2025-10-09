import { Command } from "commander";
import { buildCommand } from "./build";
import { generateCommand } from "./generate";
import { loginCommand } from "./login";
import { pushCommand } from "./push";

export const dockerCommands = new Command()
	.name("docker")
	.description("Login to Docker Hub and manage Docker images")
	.addCommand(loginCommand)
	.addCommand(buildCommand)
	.addCommand(pushCommand)
	.addCommand(generateCommand);
