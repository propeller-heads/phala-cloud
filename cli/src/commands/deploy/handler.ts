import path from "node:path";
import os from "node:os";
import type { CommandContext } from "@/src/core/types";
import { getApiKey } from "@/src/utils/credentials";
import { logger, setJsonMode } from "@/src/utils/logger";
import {
	CLOUD_URL,
	DEFAULT_DISK_SIZE,
	DEFAULT_MEMORY,
	DEFAULT_VCPU,
} from "@/src/utils/constants";
import { waitForCvmReady } from "@/src/utils/cvms";

import { detectFileInCurrentDir, promptForFile } from "@/src/utils/prompts";
import { dedupeEnvVars, parseEnvInputs } from "@/src/utils/env-parsing";
import { parseDiskSizeInput, parseMemoryInput } from "@/src/utils/units";
import {
	type Client,
	type EnvVar,
	type ErrorLink,
	type ProvisionCvmComposeFileUpdateRequest,
	ResourceError,
	createClient,
	encryptEnvVars,
	formatStructuredError,
	parseEnvVars,
	safeAddComposeHash,
	safeCommitCvmComposeFileUpdate,
	safeCommitCvmProvision,
	safeDeployAppAuth,
	safeGetAppEnvEncryptPubKey,
	safeGetAvailableNodes,
	safeGetCvmComposeFile,
	safeGetCvmInfo,
	safeGetCvmList,
	safeGetCurrentUser,
	safeGetKmsList,
	safeProvisionCvm,
	safeProvisionCvmComposeFileUpdate,
	convertToHostname,
	isValidHostname,
} from "@phala/cloud";
import dedent from "dedent";
import fs from "fs-extra";
import inquirer from "inquirer";
import type { DeployCommandInput } from "./command";

interface Options {
	name?: string;
	compose?: string;
	instanceType?: string;
	vcpu?: string;
	memory?: string;
	diskSize?: string;
	image?: string;
	region?: string;
	nodeId?: string;
	env?: string[];
	envFile?: string | boolean;
	interactive?: boolean;
	kmsId?: string;
	cvmId?: string;
	uuid?: string;
	customAppId?: string;
	preLaunchScript?: string;
	privateKey?: string;
	rpcUrl?: string;
	json?: boolean;
	debug?: boolean;
	apiKey?: string;
	wait?: boolean;
	sshPubkey?: string;
	devOs?: boolean;
	nonDevOs?: boolean;
	[key: string]: unknown;
}

/**
 * Handle provision error with structured error response
 */
function handleProvisionError(
	error: unknown,
	options: Options,
): string | object {
	// Check if it's a ResourceError with structured details
	if (error instanceof ResourceError) {
		if (options.json) {
			return {
				success: false,
				error_code: error.errorCode,
				message: error.message,
				details: error.structuredDetails,
				suggestions: error.suggestions,
				links: error.links,
			};
		}
		return formatStructuredError(error);
	}

	// Parse structured error from plain object (backward compatibility)
	if (error && typeof error === "object" && "response" in error) {
		const errorWithResponse = error as {
			response?: {
				data?: {
					detail?: unknown;
				};
			};
		};
		const errorData = errorWithResponse.response?.data?.detail;
		if (
			errorData &&
			typeof errorData === "object" &&
			"error_code" in errorData
		) {
			const { error_code, message, details, suggestions, links } =
				errorData as {
					error_code: string;
					message: string;
					details?: Array<{
						field?: string;
						value?: unknown;
						message?: string;
					}>;
					suggestions?: string[];
					links?: Array<{ url: string; label: string }>;
				};

			if (options.json) {
				return {
					success: false,
					error_code,
					message,
					details,
					suggestions,
					links,
				};
			}

			let output = `\nError [${error_code}]: ${message}\n`;

			if (details && details.length > 0) {
				output += "\nDetails:\n";
				for (const d of details) {
					if (d.message) {
						output += `  - ${d.message}\n`;
					} else if (d.field && d.value !== undefined) {
						output += `  - ${d.field}: ${d.value}\n`;
					}
				}
			}

			if (suggestions && suggestions.length > 0) {
				output += "\nSuggestions:\n";
				for (const s of suggestions) {
					output += `  - ${s}\n`;
				}
			}

			if (links && links.length > 0) {
				output += "\nLearn more:\n";
				for (const link of links) {
					output += `  - ${link.label}: ${link.url}\n`;
				}
			}

			return output;
		}
	}

	// Fallback to generic error
	const message =
		error instanceof Error ? error.message : String(error || "Unknown error");
	return options.json
		? { success: false, error: message }
		: `\nError: ${message}\n`;
}

async function getApiClient({
	apiKey,
	interactive,
}: Readonly<Pick<Options, "apiKey" | "interactive">>): Promise<Client> {
	// Priority 1: Command-line provided API key
	if (apiKey) {
		return createClient({ apiKey });
	}

	// Priority 2: Environment variable
	if (process.env.PHALA_CLOUD_API_KEY) {
		return createClient({ apiKey: process.env.PHALA_CLOUD_API_KEY });
	}

	// Priority 3: Saved API key from config file
	const savedApiKey = getApiKey();
	if (savedApiKey) {
		return createClient({ apiKey: savedApiKey });
	}

	// Priority 4: Interactive prompt (only if no API key found)
	if (interactive) {
		const { apiKey: promptedKey } = await inquirer.prompt([
			{
				type: "password",
				name: "apiKey",
				message: "Enter your API key:",
				validate: (input: string) =>
					input.trim() ? true : "API key is required",
			},
		]);
		return createClient({ apiKey: promptedKey });
	}

	// No API key available
	throw new Error(
		"API key is required. Please run 'phala auth login' or set PHALA_CLOUD_API_KEY environment variable",
	);
}

async function readDockerComposeFile({
	dockerComposePath,
	interactive,
}: {
	dockerComposePath?: string;
	interactive: boolean;
}): Promise<string> {
	// 1. If path is not provided and we're in interactive mode, try to detect it
	if (!dockerComposePath) {
		if (interactive) {
			const possibleFiles = ["docker-compose.yml", "docker-compose.yaml"];
			const composeFileName = detectFileInCurrentDir(
				possibleFiles,
				"Detected docker compose file: {path}",
			);
			dockerComposePath = await promptForFile(
				"Enter the path to your Docker Compose file:",
				composeFileName,
				"file",
			);
		} else {
			throw new Error(
				dedent(`
                       Docker Compose file is required.

                           Usage examples:
                           phala deploy --node-id 1 docker-compose.yml
                       phala deploy --node-id 6 --kms-id t16z-dev --private-key <your-private-key> --rpc-url <rpc-url> docker-compose.yml

                       Minimal required parameters:
                           --compose <path>    Path to docker-compose.yml

                       For on-chain KMS, also provide:
                               --kms-id <id>       KMS ID
                           --private-key <key> Private key for deployment

                               Run with --interactive for guided setup
                                   `),
			);
		}
	}

	// 2. Validate the file exists
	if (!fs.existsSync(dockerComposePath)) {
		throw new Error(`Docker compose file not found: ${dockerComposePath}`);
	}

	// 3. Read and return the file content
	return fs.readFileSync(dockerComposePath, "utf8");
}

const validatePrivateKey = async (
	options: Options,
	chainId: string | number | undefined,
): Promise<string | undefined> => {
	// 1. Get private key from options or environment
	let privateKey = options.privateKey || process.env.PRIVATE_KEY;

	// 2. Handle KMS related validations
	if (options.kmsId && chainId) {
		if (!options.privateKey) {
			if (options.interactive) {
				const result = await inquirer.prompt([
					{
						type: "password",
						name: "privateKey",
						message: "Enter your private key:",
						validate: (input: string) =>
							input.trim() ? true : "Private key is required",
					},
				]);
				privateKey = result.privateKey;
			} else {
				throw new Error(
					"When using on-chain KMS, either --private-key (or PRIVATE_KEY env) must be provided",
				);
			}
		}
	}
	return privateKey;
};

const validateName = async (options: Options): Promise<string | undefined> => {
	let name = options.name;

	// If name was explicitly provided via --name flag, validate it strictly
	if (options.name) {
		if (!isValidHostname(options.name)) {
			throw new Error(
				`Invalid CVM name: "${options.name}". Name must be 5-63 characters, start with letter, and contain only letters/numbers/hyphens.`,
			);
		}
		return options.name;
	}

	// If no name provided, use directory name with auto-conversion
	const folderName = path.basename(process.cwd());
	const convertedName = convertToHostname(folderName);

	if (!options.interactive) {
		// Non-interactive mode: use converted directory name
		name = convertedName;
	} else {
		// Interactive mode: prompt with converted name as default
		const result = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "Enter a name for the CVM:",
				default: convertedName,
				validate: (input) => {
					if (!input.trim()) return "CVM name is required";
					if (!isValidHostname(input.trim())) {
						return "Name must be 5-63 characters, start with letter, and contain only letters/numbers/hyphens";
					}
					return true;
				},
			},
		]);
		name = result.name;
	}

	return name;
};

const resolveEnvVars = async (
	options: Options,
): Promise<EnvVar[] | undefined> => {
	const envs: EnvVar[] = [];

	// 1. Handle deprecated --env-file (backward compatibility)
	if (options.envFile && typeof options.envFile === "string") {
		logger.warn(
			"--env-file is deprecated. Use -e <file> or -e KEY=VALUE instead.",
		);
		try {
			const envContent = fs.readFileSync(options.envFile, { encoding: "utf8" });
			envs.push(...parseEnvVars(envContent));
		} catch (error) {
			throw new Error(
				`Error reading environment file ${options.envFile}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	// 2. Handle new -e parameter (supports both files and KEY=VALUE)
	if (options.env && options.env.length > 0) {
		const parsed = parseEnvInputs(options.env);

		// Load files first (in order)
		for (const filePath of parsed.files) {
			const resolvedPath = path.resolve(process.cwd(), filePath);
			if (!fs.existsSync(resolvedPath)) {
				throw new Error(`Environment file not found: ${filePath}`);
			}
			try {
				const envContent = fs.readFileSync(resolvedPath, { encoding: "utf8" });
				envs.push(...parseEnvVars(envContent));
			} catch (error) {
				throw new Error(
					`Error reading environment file ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}

		// Add KEY=VALUE pairs (later values override earlier)
		envs.push(...parsed.keyValues);
	}

	// 3. Interactive mode: prompt if no env inputs provided
	if (
		options.interactive &&
		envs.length === 0 &&
		!options.env &&
		!options.envFile
	) {
		const { envPath } = await inquirer.prompt([
			{
				type: "input",
				name: "envPath",
				message:
					"Enter the path to your environment file (leave empty to skip):",
				default: "",
				validate: (input: string) => {
					if (!input || input.trim() === "") {
						return true;
					}
					const filePath = path.resolve(process.cwd(), input);
					if (!fs.existsSync(filePath)) {
						return `File not found at ${filePath}`;
					}
					return true;
				},
			},
		]);

		if (envPath.trim()) {
			const resolvedPath = path.resolve(process.cwd(), envPath.trim());
			const envContent = fs.readFileSync(resolvedPath, { encoding: "utf8" });
			envs.push(...parseEnvVars(envContent));
		}
	}

	// 4. Return deduplicated envs (later values override earlier)
	if (envs.length === 0) {
		return undefined;
	}

	return dedupeEnvVars(envs);
};

/**
 * Read SSH public key from file
 * - --dev-os: SSH public key is required
 * - --non-dev-os: SSH public key only if explicitly specified via --ssh-pubkey
 * - Neither flag: Try to read public key, use if available
 */
const readSshPubkey = async (options: Options): Promise<string | undefined> => {
	let sshPubkeyPath = options.sshPubkey;

	// For --non-dev-os, only use SSH key if explicitly specified
	if (options.nonDevOs && !options.sshPubkey) {
		return undefined;
	}

	// If not specified, search for default public keys (similar to ssh command)
	if (!sshPubkeyPath) {
		const homeDir = os.homedir();
		const defaultPubKeys = [
			path.join(homeDir, ".ssh", "id_rsa.pub"),
			path.join(homeDir, ".ssh", "id_ed25519.pub"),
			path.join(homeDir, ".ssh", "id_ecdsa.pub"),
			path.join(homeDir, ".ssh", "id_dsa.pub"),
		];

		for (const key of defaultPubKeys) {
			if (fs.existsSync(key)) {
				sshPubkeyPath = key;
				break;
			}
		}

		// If still no key found
		if (!sshPubkeyPath) {
			// --dev-os requires SSH public key
			if (options.devOs) {
				throw new Error(
					dedent(`
						SSH public key is required for dev images but not found.

						Searched for:
						  - ~/.ssh/id_rsa.pub
						  - ~/.ssh/id_ed25519.pub
						  - ~/.ssh/id_ecdsa.pub
						  - ~/.ssh/id_dsa.pub

						Please either:
						  1. Create an SSH key pair: ssh-keygen -t rsa
						  2. Specify a different key file: --ssh-pubkey <path>
					`),
				);
			}
			// For default case (no flags), just skip if no key found
			return undefined;
		}
	} else {
		// Expand ~ to home directory
		if (sshPubkeyPath.startsWith("~")) {
			sshPubkeyPath = path.join(os.homedir(), sshPubkeyPath.slice(1));
		}

		// Verify key file exists
		if (!fs.existsSync(sshPubkeyPath)) {
			throw new Error(`SSH public key file not found: ${sshPubkeyPath}`);
		}
	}

	// Read the public key file
	try {
		const pubkey = fs.readFileSync(sshPubkeyPath, "utf8").trim();
		logger.info(`Using SSH public key from ${sshPubkeyPath}`);
		return pubkey;
	} catch (error) {
		throw new Error(
			`Failed to read SSH public key from ${sshPubkeyPath}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};

const validateCpuMemoryDiskSize = async (options: Options) => {
	let vcpu = DEFAULT_VCPU;
	if (options.vcpu) {
		try {
			vcpu = Number(options.vcpu);
		} catch (error) {
			throw new Error(
				`Invalid vCPU format '${options.vcpu}'. Using default: ${DEFAULT_VCPU}`,
			);
		}
	}

	let memoryMB = DEFAULT_MEMORY;
	if (options.memory) {
		try {
			memoryMB = parseMemoryInput(options.memory);
		} catch (error) {
			throw new Error(
				`Invalid memory format '${options.memory}'. Using default: ${DEFAULT_MEMORY}MB`,
			);
		}
	}

	let diskSizeGB = DEFAULT_DISK_SIZE;
	if (options.diskSize) {
		try {
			diskSizeGB = parseDiskSizeInput(options.diskSize);
		} catch (error) {
			throw new Error(
				`Invalid disk size format '${options.diskSize}'. Using default: ${DEFAULT_DISK_SIZE}GB`,
			);
		}
	}

	return {
		vcpu,
		memoryMB,
		diskSizeGB,
	};
};

/**
 * Build provision payload from options
 * All parameters are optional - backend will auto-match resources
 */
const buildProvisionPayload = (
	options: Options,
	name: string,
	dockerComposeYml: string,
	envs: EnvVar[],
) => {
	const payload: Record<string, unknown> = {
		name: name,
		compose_file: {
			name: "", // Required by backend schema, defaults to empty string
			docker_compose_file: dockerComposeYml,
			allowed_envs: envs?.map((e) => e.key) || [],
		},
	};

	// Only add user-specified parameters - let backend auto-match the rest
	if (options.instanceType) {
		payload.instance_type = options.instanceType;
	}

	if (options.vcpu) {
		payload.vcpu = Number(options.vcpu);
	}

	if (options.memory) {
		payload.memory = parseMemoryInput(options.memory);
	}

	if (options.diskSize) {
		payload.disk_size = parseDiskSizeInput(options.diskSize);
	}

	if (options.nodeId) {
		payload.teepod_id = Number(options.nodeId);
	}

	if (options.region) {
		payload.region = options.region;
	}

	if (options.image) {
		payload.image = options.image;
	}

	if (options.kmsId) {
		payload.kms_id = options.kmsId;
	}

	// Add prefer_dev flag based on --dev-os or --non-dev-os
	if (options.devOs) {
		payload.prefer_dev = true;
	} else if (options.nonDevOs) {
		payload.prefer_dev = false;
	}
	// If neither flag is set, don't add prefer_dev (let backend auto-select)

	return payload;
};

const deployNewCvm = async (
	validatedOptions: Options,
	docker_compose_yml: string,
	envs: EnvVar[],
	client: Client,
	stdout: NodeJS.WriteStream,
	stderr: NodeJS.WriteStream,
) => {
	const name = await validateName(validatedOptions);

	// Read SSH public key and add to environment variables
	const sshPubkey = await readSshPubkey(validatedOptions);
	const envsWithSshKey = [...(envs || [])];
	if (sshPubkey) {
		envsWithSshKey.push({
			key: "DSTACK_AUTHORIZED_KEYS",
			value: sshPubkey,
		});
	}

	const payload = buildProvisionPayload(
		validatedOptions,
		name,
		docker_compose_yml,
		envsWithSshKey,
	);

	stdout.write(`Provisioning CVM ${name}...\n`);

	// Provision - backend will auto-match resources
	const provision_result = await safeProvisionCvm(client, payload);
	if (!provision_result.success) {
		const formattedError = handleProvisionError(
			provision_result.error,
			validatedOptions,
		);
		logger.error("Error in provisioning CVM:", formattedError);
		throw provision_result.error;
	}
	// biome-ignore lint/suspicious/noExplicitAny: type inference issue with @phala/cloud library
	const app = provision_result.data as any;
	let commit_result;

	// Check if we need on-chain KMS deployment
	const needsOnchainKms = validatedOptions.kmsId && !app.app_id;

	if (needsOnchainKms) {
		// For on-chain KMS, we need to get KMS info and deploy contract
		const kms_result = await safeGetKmsList(client);
		if (!kms_result.success) {
			throw new Error(`Failed to get KMS list: ${kms_result.error.message}`);
		}

		// biome-ignore lint/suspicious/noExplicitAny: type inference issue with @phala/cloud library
		const kms_list = kms_result.data as any;
		const kms = kms_list.items.find(
			// biome-ignore lint/suspicious/noExplicitAny: type inference issue with @phala/cloud library
			(k: any) =>
				k.slug === validatedOptions.kmsId || k.id === validatedOptions.kmsId,
		);

		if (!kms || !kms.chain_id) {
			throw new Error(`KMS ${validatedOptions.kmsId} not found or invalid`);
		}

		// Validate private key for on-chain KMS
		const privateKey = await validatePrivateKey(validatedOptions, kms.chain_id);

		// Deploy contract
		const deploy_result = await safeDeployAppAuth({
			chain: kms.chain,
			rpcUrl: validatedOptions.rpcUrl,
			kmsContractAddress: kms.kms_contract_address,
			privateKey: privateKey as `0x${string}`,
			deviceId: app.device_id,
			composeHash: app.compose_hash,
		});

		if (!deploy_result.success) {
			logger.logDetailedError(deploy_result, "Deploy App Auth");
			const errorMsg =
				typeof deploy_result === "object" && deploy_result !== null
					? JSON.stringify(deploy_result)
					: String(deploy_result);
			throw new Error(`Deployment contract failed: ${errorMsg}`);
		}

		// biome-ignore lint/suspicious/noExplicitAny: type inference issue with @phala/cloud library
		const deployed_contract = deploy_result.data as any;

		// Get encryption key
		const resp = await safeGetAppEnvEncryptPubKey(client, {
			app_id: deployed_contract.appId,
			kms: kms.slug,
		});

		if (!resp.success) {
			logger.logDetailedError(resp.error, "Get App Env Encrypt PubKey");
			throw new Error(
				`Failed to get app env encrypt pubkey: ${resp.error.message}`,
			);
		}

		// biome-ignore lint/suspicious/noExplicitAny: type inference issue with @phala/cloud library
		const pubkey_signature = resp.data as any;
		const encrypted_env_vars = await encryptEnvVars(
			envsWithSshKey,
			pubkey_signature.public_key,
		);

		commit_result = await safeCommitCvmProvision(client, {
			app_id: deployed_contract.appId,
			encrypted_env: encrypted_env_vars,
			compose_hash: app.compose_hash,
			kms_id: kms.slug,
			contract_address: deployed_contract.appAuthAddress,
			deployer_address: deployed_contract.deployer,
		});
	} else {
		// Centralized KMS or provision already has app_id
		const encrypted_env_vars =
			envsWithSshKey && envsWithSshKey.length > 0
				? await encryptEnvVars(envsWithSshKey, app.app_env_encrypt_pubkey)
				: undefined;

		commit_result = await safeCommitCvmProvision(client, {
			app_id: app.app_id,
			encrypted_env: encrypted_env_vars,
			compose_hash: app.compose_hash,
			kms_id: validatedOptions.kmsId,
		});
	}

	if (!commit_result.success) {
		logger.logDetailedError(commit_result.error, "Commit CVM Provision");
		throw new Error(
			`Failed to commit CVM provision: ${commit_result.error.message}`,
		);
	}
	// biome-ignore lint/suspicious/noExplicitAny: type inference issue with @phala/cloud library
	const cvm = commit_result.data as any;

	if (validatedOptions?.json !== false) {
		stdout.write(
			`${JSON.stringify(
				{
					success: true,
					vm_uuid: cvm.vm_uuid,
					name: cvm.name,
					app_id: cvm.app_id,
					dashboard_url: `${CLOUD_URL}/dashboard/cvms/${cvm.vm_uuid}`,
				},
				null,
				2,
			)}\n`,
		);
	} else {
		const successMessage = dedent`
      CVM created successfully!

      CVM ID:    ${cvm.vm_uuid}
      Name:      ${cvm.name}
      App ID:    ${cvm.app_id}
      Dashboard URL:  ${CLOUD_URL}/dashboard/cvms/${cvm.vm_uuid}
    `;
		stdout.write(`${successMessage}\n`);
	}
};

const updateCvm = async (
	validatedOptions: Options,
	docker_compose_yml: string,
	envs: EnvVar[] | undefined,
	client: Client,
	stdout: NodeJS.WriteStream,
) => {
	const [cvm_result, app_compose_result] = await Promise.all([
		safeGetCvmInfo(client, {
			id: validatedOptions.uuid,
		}),
		safeGetCvmComposeFile(client, {
			id: validatedOptions.uuid,
		}),
	]);
	if (!cvm_result.success) {
		logger.logDetailedError(cvm_result.error, "Get CVM Info");
		throw new Error(`Failed to get cvm info: ${cvm_result.error.message}`);
	}
	if (!app_compose_result.success) {
		logger.logDetailedError(app_compose_result.error, "Get CVM Compose File");
		throw new Error(
			`Failed to get cvm compose file: ${app_compose_result.error.message}`,
		);
	}
	// biome-ignore lint/suspicious/noExplicitAny: type inference issue with @phala/cloud library
	const cvm = cvm_result.data as any;
	// biome-ignore lint/suspicious/noExplicitAny: type inference issue with @phala/cloud library
	const app_compose = app_compose_result.data as any;

	// patched the compose_file
	app_compose.docker_compose_file = docker_compose_yml;
	if (envs && envs.length > 0) {
		app_compose.allowed_envs = envs.map((env) => env.key);
	}

	logger.info(`Preparing update for CVM ${validatedOptions.uuid}...`);
	const provision_result = await safeProvisionCvmComposeFileUpdate(client, {
		id: validatedOptions.uuid,
		app_compose:
			app_compose as ProvisionCvmComposeFileUpdateRequest["app_compose"],
	});
	if (!provision_result.success) {
		logger.logDetailedError(
			provision_result.error,
			"Provision CVM Compose File Update",
		);
		throw new Error(
			`Failed to provision cvm compose file: ${provision_result.error.message}`,
		);
	}
	// biome-ignore lint/suspicious/noExplicitAny: type inference issue with @phala/cloud library
	const provision = provision_result.data as any;

	let encrypted_env: string | undefined;
	if (cvm.kms_info?.chain_id) {
		// Update with decentralized KMS.
		if (!validatedOptions.privateKey) {
			throw new Error("Private key is required for contract DstackApp");
		}

		const receipt_result = await safeAddComposeHash({
			chain: cvm.kms_info?.chain,
			rpcUrl: validatedOptions.rpcUrl,
			appId: cvm.app_id as `0x${string}`,
			composeHash: provision.compose_hash,
			privateKey: validatedOptions.privateKey as `0x${string}`,
		});
		if (!receipt_result.success) {
			logger.logDetailedError(receipt_result, "Add Compose Hash");
			const errorMsg =
				typeof receipt_result === "object" && receipt_result !== null
					? JSON.stringify(receipt_result)
					: String(receipt_result);
			throw new Error(`Failed to add compose hash: ${errorMsg}`);
		}

		// Encrypt environment variables for decentralized KMS
		if (envs && envs.length > 0) {
			const kmsSlug = cvm.kms_info?.slug || cvm.kms_info?.id;
			if (!kmsSlug) {
				throw new Error("KMS slug or id is required for decentralized KMS");
			}

			const resp = await safeGetAppEnvEncryptPubKey(client, {
				app_id: cvm.app_id,
				kms: kmsSlug,
			});

			if (!resp.success) {
				logger.logDetailedError(resp.error, "Get App Env Encrypt PubKey");
				throw new Error(
					`Failed to get app env encrypt pubkey: ${resp.error.message}`,
				);
			}

			// biome-ignore lint/suspicious/noExplicitAny: type inference issue with @phala/cloud library
			const pubkey_signature = resp.data as any;
			encrypted_env = await encryptEnvVars(envs, pubkey_signature.public_key);
		}
	} else {
		if (envs && envs.length > 0) {
			if (!cvm.encrypted_env_pubkey) {
				throw new Error(
					"CVM encrypted_env_pubkey is required for centralized KMS",
				);
			}
			const encrypted_env_vars = await encryptEnvVars(
				envs,
				cvm.encrypted_env_pubkey,
			);
			encrypted_env = encrypted_env_vars;
		}
	}

	const data = {
		id: validatedOptions.uuid,
		compose_hash: provision.compose_hash,
		encrypted_env: encrypted_env,
		env_keys: envs?.length ? envs.map((env) => env.key) : undefined,
		update_env_vars: envs?.length ? true : undefined,
	};
	// @ts-ignore
	const commitResult = await safeCommitCvmComposeFileUpdate(client, data);

	if (!commitResult.success) {
		logger.logDetailedError(
			commitResult.error,
			"Commit CVM Compose File Update",
		);
		throw new Error(
			`Failed to commit CVM compose file update: ${commitResult.error.message}`,
		);
	}
	// Wait for update to complete if --wait flag is set
	if (validatedOptions.wait) {
		logger.info("Waiting for update to complete...");
		try {
			await waitForCvmReady(
				validatedOptions.uuid as string,
				300000, // 5 minutes timeout
			);
		} catch (error: unknown) {
			logger.logDetailedError(error, "Wait for CVM Ready");
			throw new Error(
				`Wait failed: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	if (validatedOptions?.json !== false) {
		stdout.write(
			`${JSON.stringify(
				{
					success: true,
					vm_uuid: validatedOptions.uuid,
					name: cvm.name,
					app_id: cvm.app_id,
					dashboard_url: `${CLOUD_URL}/dashboard/cvms/${validatedOptions.uuid}`,
				},
				null,
				2,
			)}\n`,
		);
	} else {
		stdout.write("CVM compose file updated successfully!\n");
	}
};

export async function runDeploy(
	input: DeployCommandInput,
	context: CommandContext,
): Promise<void> {
	// Enable JSON mode if --json flag is set
	setJsonMode(input.json || false);

	try {
		// Use positional argument if provided, otherwise use the --compose option
		const dockerComposePath = input.compose;

		const client = await getApiClient({
			apiKey: input.apiKey,
			interactive: input.interactive,
		});

		const docker_compose_yml = await readDockerComposeFile({
			dockerComposePath: dockerComposePath,
			interactive: input.interactive,
		});

		const envs = await resolveEnvVars(input as Options);

		// Get CVM ID from context (already resolved with priority: interactive > --cvm-id > phala.toml)
		if (input.debug) {
			console.log("[DEBUG] context.cvmId:", JSON.stringify(context.cvmId));
			console.log("[DEBUG] input.cvmId:", input.cvmId);
		}

		const uuid =
			context.cvmId?.id ||
			context.cvmId?.uuid ||
			context.cvmId?.app_id ||
			context.cvmId?.instance_id;

		if (input.debug) {
			console.log("[DEBUG] resolved uuid:", uuid);
			console.log("[DEBUG] isUpdate:", !!uuid);
		}

		const isUpdate = !!uuid;
		if (isUpdate) {
			// Update the existing CVM
			await updateCvm(
				{
					...input,
					uuid,
				},
				docker_compose_yml,
				envs,
				client,
				context.stdout,
			);
		} else {
			// Deploy a new CVM
			await deployNewCvm(
				input,
				docker_compose_yml,
				envs ?? [],
				client,
				context.stdout,
				context.stderr,
			);
		}
	} catch (error) {
		if (input.json !== false) {
			context.stderr.write(
				`${JSON.stringify(
					{
						success: false,
						error: error instanceof Error ? error.message : String(error),
						stack:
							input.debug && error instanceof Error ? error.stack : undefined,
					},
					null,
					2,
				)}\n`,
			);
		} else {
			context.stderr.write(
				`${dedent`${error instanceof Error ? error.message : String(error)}`}\n`,
			);
		}
		throw error;
	}
}
