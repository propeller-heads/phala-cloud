import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { parse_cvm_id, loadProjectConfig } from "./project-config";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

describe("parse_cvm_id", () => {
	test("should return undefined for undefined input", () => {
		expect(parse_cvm_id(undefined)).toBeUndefined();
	});

	test("should return undefined for empty string", () => {
		expect(parse_cvm_id("")).toBeUndefined();
	});

	test("should parse plain string as-is", () => {
		const result = parse_cvm_id("my-cvm-name");
		expect(result).toBe("my-cvm-name");
	});

	test("should parse UUID format (remove dashes)", () => {
		const result = parse_cvm_id("550e8400-e29b-41d4-a716-446655440000");
		expect(result).toBe("550e8400e29b41d4a716446655440000");
	});

	test("should parse 40-char hex (add app_ prefix)", () => {
		const result = parse_cvm_id("50b0e827cc6c53f4010b57e588a18c5ef9388cc1");
		expect(result).toBe("app_50b0e827cc6c53f4010b57e588a18c5ef9388cc1");
	});

	test("should keep existing app_ prefix", () => {
		const result = parse_cvm_id("app_50b0e827cc6c53f4010b57e588a18c5ef9388cc1");
		expect(result).toBe("app_50b0e827cc6c53f4010b57e588a18c5ef9388cc1");
	});

	test("should keep existing instance_ prefix", () => {
		const result = parse_cvm_id("instance_xxx");
		expect(result).toBe("instance_xxx");
	});
});

describe("loadProjectConfig", () => {
	let tmpDir: string;
	let originalCwd: string;

	beforeEach(() => {
		// Create temp directory for testing
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "phala-test-"));
		originalCwd = process.cwd();
		process.chdir(tmpDir);
	});

	afterEach(() => {
		// Restore original directory and cleanup
		process.chdir(originalCwd);
		fs.removeSync(tmpDir);
	});

	test("should load cvm_id from id field", () => {
		fs.writeFileSync(path.join(tmpDir, "phala.toml"), 'id = "test-id"', "utf8");

		const config = loadProjectConfig();
		expect(config.cvm_id).toBe("test-id");
	});

	test("should load cvm_id from uuid field", () => {
		fs.writeFileSync(
			path.join(tmpDir, "phala.toml"),
			'uuid = "550e8400-e29b-41d4-a716-446655440000"',
			"utf8",
		);

		const config = loadProjectConfig();
		expect(config.cvm_id).toBe("550e8400e29b41d4a716446655440000");
	});

	test("should load cvm_id from app_id field", () => {
		fs.writeFileSync(
			path.join(tmpDir, "phala.toml"),
			'app_id = "50b0e827cc6c53f4010b57e588a18c5ef9388cc1"',
			"utf8",
		);

		const config = loadProjectConfig();
		expect(config.cvm_id).toBe("app_50b0e827cc6c53f4010b57e588a18c5ef9388cc1");
	});

	test("should load cvm_id from name field", () => {
		fs.writeFileSync(
			path.join(tmpDir, "phala.toml"),
			'name = "my-cvm-name"',
			"utf8",
		);

		const config = loadProjectConfig();
		expect(config.cvm_id).toBe("my-cvm-name");
	});

	test("should prioritize id over other fields", () => {
		fs.writeFileSync(
			path.join(tmpDir, "phala.toml"),
			`
id = "id-field"
app_id = "50b0e827cc6c53f4010b57e588a18c5ef9388cc1"
name = "name-field"
`,
			"utf8",
		);

		const config = loadProjectConfig();
		expect(config.cvm_id).toBe("id-field");
	});

	test("should load gateway_domain", () => {
		fs.writeFileSync(
			path.join(tmpDir, "phala.toml"),
			'gateway_domain = "gateway.example.com"',
			"utf8",
		);

		const config = loadProjectConfig();
		expect(config.gateway_domain).toBe("gateway.example.com");
	});

	test("should load gateway_port", () => {
		fs.writeFileSync(
			path.join(tmpDir, "phala.toml"),
			"gateway_port = 8080",
			"utf8",
		);

		const config = loadProjectConfig();
		expect(config.gateway_port).toBe(8080);
	});

	test("should return empty config when no cvm id fields", () => {
		fs.writeFileSync(
			path.join(tmpDir, "phala.toml"),
			'gateway_domain = "gateway.example.com"',
			"utf8",
		);

		const config = loadProjectConfig();
		expect(config.cvm_id).toBeUndefined();
		expect(config.gateway_domain).toBe("gateway.example.com");
	});

	test("should throw error when file does not exist", () => {
		expect(() => loadProjectConfig()).toThrow(/not found/);
	});

	test("should throw error on invalid TOML", () => {
		fs.writeFileSync(
			path.join(tmpDir, "phala.toml"),
			"invalid toml [[[",
			"utf8",
		);

		expect(() => loadProjectConfig()).toThrow();
	});

	test("should load compose_file", () => {
		fs.writeFileSync(
			path.join(tmpDir, "phala.toml"),
			'compose_file = "docker-compose.yml"',
			"utf8",
		);

		const config = loadProjectConfig();
		expect(config.compose_file).toBe("docker-compose.yml");
	});

	test("should load env_file", () => {
		fs.writeFileSync(
			path.join(tmpDir, "phala.toml"),
			'env_file = ".env.production"',
			"utf8",
		);

		const config = loadProjectConfig();
		expect(config.env_file).toBe(".env.production");
	});

	test("should load compose_file and env_file with cvm_id", () => {
		fs.writeFileSync(
			path.join(tmpDir, "phala.toml"),
			`
name = "my-cvm"
compose_file = "docker-compose.yml"
env_file = ".env.production"
`,
			"utf8",
		);

		const config = loadProjectConfig();
		expect(config.cvm_id).toBe("my-cvm");
		expect(config.compose_file).toBe("docker-compose.yml");
		expect(config.env_file).toBe(".env.production");
	});

	test("should load all deploy config fields together", () => {
		fs.writeFileSync(
			path.join(tmpDir, "phala.toml"),
			`
name = "my-app"
compose_file = "docker-compose.yaml"
env_file = ".env"
gateway_domain = "gateway.example.com"
gateway_port = 443
`,
			"utf8",
		);

		const config = loadProjectConfig();
		expect(config.cvm_id).toBe("my-app");
		expect(config.compose_file).toBe("docker-compose.yaml");
		expect(config.env_file).toBe(".env");
		expect(config.gateway_domain).toBe("gateway.example.com");
		expect(config.gateway_port).toBe(443);
	});
});
