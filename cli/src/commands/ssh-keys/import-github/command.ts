import { z } from "zod";
import type { CommandArgument, CommandMeta } from "@/src/core/types";

const githubUsernameArgument: CommandArgument = {
	name: "github_username",
	description: "GitHub username to import SSH keys from",
	required: true,
	target: "githubUsername",
};

export const sshKeysImportGithubCommandMeta: CommandMeta = {
	name: "import-github",
	description: "Import SSH keys from a GitHub user's public profile",
	stability: "stable",
	arguments: [githubUsernameArgument],
	examples: [
		{
			name: "Import SSH keys from a GitHub profile",
			value: "phala ssh-keys import-github octocat",
		},
	],
};

export const sshKeysImportGithubCommandSchema = z.object({
	githubUsername: z.string(),
});

export type SshKeysImportGithubCommandInput = z.infer<
	typeof sshKeysImportGithubCommandSchema
>;
