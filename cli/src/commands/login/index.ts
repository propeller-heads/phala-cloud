import chalk from "chalk";
import open from "open";
import ora from "ora";
import prompts from "prompts";

import {
	createClient,
	safeGetCurrentUser,
	BusinessError,
	type PhalaCloudError,
} from "@phala/cloud";

import type { UserInfoResponse } from "@/src/api/types";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { getClientWithKey } from "@/src/lib/client";
import { removeApiKey, saveApiKey } from "@/src/utils/credentials";

import { loginCommandMeta, loginCommandSchema } from "./command";
import type { LoginCommandInput } from "./command";

// Device auth response types
interface DeviceCodeResponse {
	device_code: string;
	user_code: string;
	verification_uri: string;
	verification_uri_complete: string;
	expires_in: number;
	interval: number;
}

interface DeviceTokenResponse {
	access_token: string;
	token_type: string;
}

interface DeviceTokenError {
	error: string;
	error_description?: string;
}

/**
 * Extract device auth error from PhalaCloudError
 * Device auth errors have a specific structure in the detail field
 */
function extractDeviceAuthError(
	error: PhalaCloudError,
): DeviceTokenError | null {
	const { detail } = error;

	// Device auth errors have detail as an object with 'error' field
	if (detail && typeof detail === "object" && !Array.isArray(detail)) {
		const detailObj = detail as Record<string, unknown>;
		if (detailObj.error && typeof detailObj.error === "string") {
			return {
				error: detailObj.error,
				error_description:
					typeof detailObj.error_description === "string"
						? detailObj.error_description
						: undefined,
			};
		}
	}

	return null;
}

async function validateAndPersistApiKey(
	apiKey: string,
): Promise<UserInfoResponse> {
	try {
		await saveApiKey(apiKey);
		const client = await getClientWithKey(apiKey);
		const result = await safeGetCurrentUser(client);
		const userData = result.data as UserInfoResponse;

		if (!result.success || !userData?.username) {
			await removeApiKey();
			throw new Error("Invalid API key");
		}

		return userData;
	} catch (error) {
		await removeApiKey();
		throw error instanceof Error ? error : new Error(String(error));
	}
}

async function promptForApiKey(): Promise<{
	apiKey: string;
	user: UserInfoResponse;
}> {
	let cachedUser: UserInfoResponse | undefined;
	const response = await prompts({
		type: "password",
		name: "apiKey",
		message: "Enter your API key:",
		validate: async (value: string) => {
			if (!value || value.trim().length === 0) {
				return "API key cannot be empty";
			}
			try {
				cachedUser = await validateAndPersistApiKey(value);
				return true;
			} catch (error) {
				return error instanceof Error ? error.message : "Invalid API key";
			}
		},
	});

	if (!response.apiKey) {
		throw new Error("API key input cancelled");
	}

	if (!cachedUser) {
		cachedUser = await validateAndPersistApiKey(response.apiKey);
	}

	return { apiKey: response.apiKey, user: cachedUser };
}

async function runDeviceAuthFlow(options: {
	noOpen?: boolean;
}): Promise<string> {
	// Create client without API key - SDK will read PHALA_CLOUD_API_PREFIX from env
	const client = createClient({ useCookieAuth: true });

	// Step 1: Request device authorization codes
	const codeResponse = await client.post<DeviceCodeResponse>(
		"/auth/device/code",
		{
			client_id: "phala-cli",
			scope: "user:profile cvms:* nodes:*",
		},
	);

	const {
		device_code,
		user_code,
		verification_uri_complete,
		interval,
		expires_in,
	} = codeResponse;

	// Step 2: Display verification information
	console.log();
	console.log(chalk.bold("To authenticate, visit:"));
	console.log(chalk.cyan(verification_uri_complete));
	console.log();
	console.log(chalk.bold("And enter code:"), chalk.yellow(user_code));
	console.log();

	// Step 3: Open browser (optional)
	if (!options.noOpen) {
		try {
			await open(verification_uri_complete);
			console.log("Opening browser automatically...");
		} catch (error) {
			console.warn(
				"Could not open browser automatically. Please visit the URL above.",
			);
		}
	}

	// Step 4: Poll for authorization
	const spinner = ora("Waiting for authorization...").start();
	const expiresAt = Date.now() + expires_in * 1000;

	while (Date.now() < expiresAt) {
		await new Promise((resolve) => setTimeout(resolve, interval * 1000));

		try {
			const tokenResponse = await client.post<DeviceTokenResponse>(
				"/auth/device/token",
				{
					device_code,
					grant_type: "urn:ietf:params:oauth:grant-type:device_code",
				},
			);

			spinner.succeed("Authorization successful!");
			return tokenResponse.access_token;
		} catch (error) {
			// Handle device auth errors using proper SDK error types
			if (error instanceof BusinessError) {
				const deviceAuthError = extractDeviceAuthError(error);

				if (deviceAuthError) {
					// Handle known device auth error types
					switch (deviceAuthError.error) {
						case "authorization_pending":
							// Keep polling - this is expected
							continue;

						case "expired_token":
							spinner.fail("Authorization expired");
							throw new Error(
								deviceAuthError.error_description ||
									"Device authorization expired. Please try again.",
							);

						case "access_denied":
							spinner.fail("Authorization denied");
							throw new Error(
								deviceAuthError.error_description ||
									"You denied the authorization request.",
							);

						default:
							// Unknown device auth error
							spinner.fail("Authorization failed");
							throw new Error(
								`Authorization failed: ${deviceAuthError.error_description || deviceAuthError.error}`,
							);
					}
				}
			}

			// Not a device auth error or unknown error type
			spinner.fail("Request failed");
			throw error;
		}
	}

	spinner.fail("Authorization timed out");
	throw new Error("Authorization timed out. Please try again.");
}

export async function runLoginCommand(
	input: LoginCommandInput,
	_context: CommandContext,
): Promise<number> {
	try {
		let apiKey: string;
		let user: UserInfoResponse | undefined;

		// Decide authentication method
		if (input.apiKey) {
			// Method 1: Direct API key as argument
			apiKey = input.apiKey;
		} else if (input.manual) {
			// Method 2: Manual interactive input
			const result = await promptForApiKey();
			apiKey = result.apiKey;
			user = result.user;
		} else {
			// Method 3: Device authorization flow (default)
			apiKey = await runDeviceAuthFlow({
				noOpen: input.noOpen,
			});
		}

		// Validate and persist API key if not already done
		if (!user) {
			user = await validateAndPersistApiKey(apiKey);
		}

		if (!user) {
			throw new Error("Failed to validate API key");
		}

		console.log(
			chalk.green(
				`Welcome ${user.username}! API key validated and saved successfully`,
			),
		);
		return 0;
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to authenticate: ${error instanceof Error ? error.message : String(error)}`,
			),
		);
		return 1;
	}
}

export const loginCommand = defineCommand({
	path: ["login"],
	meta: loginCommandMeta,
	schema: loginCommandSchema,
	handler: runLoginCommand,
});

export default loginCommand;
