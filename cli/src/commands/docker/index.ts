import { z } from "zod";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext, CommandMeta } from "@/src/core/types";
import { dockerGroup } from "./command";
import { dockerBuildCommand } from "./build/index";
import { dockerGenerateCommand } from "./generate/index";
import { dockerLoginCommand } from "./login/index";
import { dockerPushCommand } from "./push/index";
import { dockerRunCommand } from "./run/index";

const dockerRootMeta: CommandMeta = {
	name: "docker",
	description: "Login to Docker Hub and manage Docker images",
};

const dockerRootSchema = z.object({});

async function runDockerRoot(
	_input: z.infer<typeof dockerRootSchema>,
	context: CommandContext,
): Promise<number> {
	context.stdout.write(
		"Available docker subcommands: login, build, push, generate, run. Use 'phala docker <command> --help' for details.\n",
	);
	return 0;
}

export const dockerRootCommand = defineCommand({
	path: ["docker"],
	meta: dockerRootMeta,
	schema: dockerRootSchema,
	handler: runDockerRoot,
});

export const dockerCommands = {
	group: dockerGroup,
	commands: [
		dockerRootCommand,
		dockerLoginCommand,
		dockerBuildCommand,
		dockerPushCommand,
		dockerGenerateCommand,
		dockerRunCommand,
	],
};

export default dockerCommands;
