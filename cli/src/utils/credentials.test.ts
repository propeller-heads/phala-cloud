import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
	getCredentialsFilePath,
	resolveAuth,
	upsertProfile,
} from "./credentials";

function makeTempHome(): string {
	return fs.mkdtempSync(path.join(os.tmpdir(), "phala-cli-home-"));
}

function cleanupDir(dir: string): void {
	try {
		fs.rmSync(dir, { recursive: true, force: true });
	} catch {
		// ignore
	}
}

describe("credentials", () => {
	let tempHome: string;
	let oldHome: string | undefined;
	let oldApiKey: string | undefined;
	let oldApiPrefix: string | undefined;
	let oldCloudDir: string | undefined;

	beforeEach(() => {
		oldHome = process.env.HOME;
		oldApiKey = process.env.PHALA_CLOUD_API_KEY;
		oldApiPrefix = process.env.PHALA_CLOUD_API_PREFIX;
		oldCloudDir = process.env.PHALA_CLOUD_DIR;

		tempHome = makeTempHome();
		process.env.HOME = tempHome;
		process.env.PHALA_CLOUD_DIR = path.join(tempHome, ".phala-cloud");
		process.env.PHALA_CLOUD_API_KEY = undefined;
		process.env.PHALA_CLOUD_API_PREFIX = undefined;
	});

	afterEach(() => {
		if (oldHome !== undefined) process.env.HOME = oldHome;
		else process.env.HOME = undefined;
		if (oldApiKey !== undefined) process.env.PHALA_CLOUD_API_KEY = oldApiKey;
		else process.env.PHALA_CLOUD_API_KEY = undefined;
		if (oldApiPrefix !== undefined)
			process.env.PHALA_CLOUD_API_PREFIX = oldApiPrefix;
		else process.env.PHALA_CLOUD_API_PREFIX = undefined;
		if (oldCloudDir !== undefined) process.env.PHALA_CLOUD_DIR = oldCloudDir;
		else process.env.PHALA_CLOUD_DIR = undefined;

		cleanupDir(tempHome);
	});

	test("resolveAuth prioritizes flag > env > file", () => {
		// Prepare file credentials
		upsertProfile({
			profileName: "p1",
			token: "file-token",
			apiPrefix: "https://file.example/api/v1",
			workspaceName: "ws",
			user: { username: "u" },
			setCurrent: true,
		});

		// env wins over file
		process.env.PHALA_CLOUD_API_KEY = "env-token";
		let resolved = resolveAuth({ env: process.env });
		expect(resolved.apiKey).toBe("env-token");
		expect(resolved.tokenSource).toBe("env");

		// flag wins over env
		resolved = resolveAuth({ env: process.env, apiToken: "flag-token" });
		expect(resolved.apiKey).toBe("flag-token");
		expect(resolved.tokenSource).toBe("flag");
	});

	test("resolveAuth uses projectProfile over current_profile", () => {
		upsertProfile({
			profileName: "a",
			token: "token-a",
			apiPrefix: "https://a.example/api/v1",
			workspaceName: "a",
			user: { username: "u" },
			setCurrent: true,
		});
		upsertProfile({
			profileName: "b",
			token: "token-b",
			apiPrefix: "https://b.example/api/v1",
			workspaceName: "b",
			user: { username: "u" },
			setCurrent: false,
		});

		const resolved = resolveAuth({ env: process.env, projectProfile: "b" });
		expect(resolved.profileName).toBe("b");
		expect(resolved.apiKey).toBe("token-b");
		expect(resolved.baseURL).toBe("https://b.example/api/v1");
	});

	test("api prefix resolution: env > profile > default", () => {
		upsertProfile({
			profileName: "p",
			token: "t",
			apiPrefix: "https://profile.example/api/v1",
			workspaceName: "p",
			user: { username: "u" },
			setCurrent: true,
		});

		let resolved = resolveAuth({ env: process.env });
		expect(resolved.baseURL).toBe("https://profile.example/api/v1");
		expect(resolved.apiPrefixSource).toBe("file");

		process.env.PHALA_CLOUD_API_PREFIX = "https://env.example/api/v1";
		resolved = resolveAuth({ env: process.env });
		expect(resolved.baseURL).toBe("https://env.example/api/v1");
		expect(resolved.apiPrefixSource).toBe("env");
	});

	test("upsertProfile persists credentials.json with schema_version=1", () => {
		upsertProfile({
			profileName: "team",
			token: "tok",
			workspaceName: "team",
			user: { username: "alice", email: "alice@example.com" },
			setCurrent: true,
		});

		const filePath = getCredentialsFilePath();
		expect(fs.existsSync(filePath)).toBe(true);

		const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
			schema_version: number;
			current_profile: string;
			profiles: Record<string, { token: string; api_prefix: string }>;
		};
		expect(parsed.schema_version).toBe(1);
		expect(parsed.current_profile).toBe("team");
		expect(parsed.profiles.team.token).toBe("tok");
	});
});
