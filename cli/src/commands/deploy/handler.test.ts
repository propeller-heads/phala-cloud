/**
 * Deploy Handler Tests
 *
 * Tests for the buildProvisionPayload function to ensure
 * proper handling of --dev-os and --non-dev-os flags.
 */

import { describe, test, expect } from "bun:test";
import { buildProvisionPayload } from "./handler";

describe("buildProvisionPayload", () => {
	const defaultName = "test-cvm";
	const defaultDockerCompose =
		"version: '3'\nservices:\n  app:\n    image: nginx";
	const defaultEnvs = [{ key: "NODE_ENV", value: "production" }];
	const defaultPrivacySettings = {
		publicLogs: false,
		publicSysinfo: true,
		listed: false,
	};

	describe("prefer_dev flag handling (--dev-os / --non-dev-os)", () => {
		test("should set prefer_dev to true when devOs is true", () => {
			const options = {
				devOs: true,
				nonDevOs: false,
			};

			const payload = buildProvisionPayload(
				options,
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);

			expect(payload.prefer_dev).toBe(true);
		});

		test("should set prefer_dev to false when nonDevOs is true", () => {
			const options = {
				devOs: false,
				nonDevOs: true,
			};

			const payload = buildProvisionPayload(
				options,
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);

			expect(payload.prefer_dev).toBe(false);
		});

		test("should not include prefer_dev when neither flag is set", () => {
			const options = {
				devOs: false,
				nonDevOs: false,
			};

			const payload = buildProvisionPayload(
				options,
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);

			expect("prefer_dev" in payload).toBe(false);
		});

		test("should not include prefer_dev when both flags are undefined", () => {
			const options = {};

			const payload = buildProvisionPayload(
				options,
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);

			expect("prefer_dev" in payload).toBe(false);
		});

		test("devOs takes precedence when both are true (edge case)", () => {
			// This is an edge case that shouldn't happen in practice
			// due to CLI validation, but we test the code behavior
			const options = {
				devOs: true,
				nonDevOs: true,
			};

			const payload = buildProvisionPayload(
				options,
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);

			// devOs is checked first in if-else chain
			expect(payload.prefer_dev).toBe(true);
		});
	});

	describe("basic payload structure", () => {
		test("should include name and compose_file in payload", () => {
			const options = {};

			const payload = buildProvisionPayload(
				options,
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);

			expect(payload.name).toBe(defaultName);
			expect(payload.compose_file).toBeDefined();
			expect(
				(payload.compose_file as Record<string, unknown>).docker_compose_file,
			).toBe(defaultDockerCompose);
			expect(
				(payload.compose_file as Record<string, unknown>).allowed_envs,
			).toEqual(["NODE_ENV"]);
		});

		test("should include optional fields when specified", () => {
			const options = {
				instanceType: "tdx.small",
				vcpu: "2",
				memory: "4G",
				diskSize: "50G",
				nodeId: "123",
				region: "us-west",
				image: "dstack-dev-0.5.0",
				kmsId: "phala",
				devOs: true,
			};

			const payload = buildProvisionPayload(
				options,
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);

			expect(payload.instance_type).toBe("tdx.small");
			expect(payload.vcpu).toBe(2);
			expect(payload.memory).toBe(4096); // 4G = 4096MB
			expect(payload.disk_size).toBe(50); // 50G = 50GB
			expect(payload.teepod_id).toBe(123);
			expect(payload.region).toBe("us-west");
			expect(payload.image).toBe("dstack-dev-0.5.0");
			expect(payload.kms_id).toBe("phala");
			expect(payload.prefer_dev).toBe(true);
		});

		test("should not include optional fields when not specified", () => {
			const options = {};

			const payload = buildProvisionPayload(
				options,
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);

			expect("instance_type" in payload).toBe(false);
			expect("vcpu" in payload).toBe(false);
			expect("memory" in payload).toBe(false);
			expect("disk_size" in payload).toBe(false);
			expect("teepod_id" in payload).toBe(false);
			expect("region" in payload).toBe(false);
			expect("image" in payload).toBe(false);
			expect("kms_id" in payload).toBe(false);
			expect("prefer_dev" in payload).toBe(false);
		});
	});

	describe("empty envs handling", () => {
		test("should handle empty envs array", () => {
			const options = {};

			const payload = buildProvisionPayload(
				options,
				defaultName,
				defaultDockerCompose,
				[],
				defaultPrivacySettings,
			);

			expect(
				(payload.compose_file as Record<string, unknown>).allowed_envs,
			).toEqual([]);
		});
	});

	describe("vcpu/memory without instance_type (deprecated params)", () => {
		test("should include vcpu/memory but NOT instance_type when only vcpu/memory specified", () => {
			const options = {
				vcpu: "4",
				memory: "8G",
			};

			const payload = buildProvisionPayload(
				options,
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);

			// vcpu/memory should be included
			expect(payload.vcpu).toBe(4);
			expect(payload.memory).toBe(8192); // 8G = 8192MB

			// instance_type should NOT be included (let backend match based on vcpu/memory)
			expect("instance_type" in payload).toBe(false);
		});

		test("should include only vcpu when memory not specified", () => {
			const options = {
				vcpu: "4",
			};

			const payload = buildProvisionPayload(
				options,
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);

			expect(payload.vcpu).toBe(4);
			expect("memory" in payload).toBe(false);
			expect("instance_type" in payload).toBe(false);
		});

		test("should include only memory when vcpu not specified", () => {
			const options = {
				memory: "8G",
			};

			const payload = buildProvisionPayload(
				options,
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);

			expect(payload.memory).toBe(8192);
			expect("vcpu" in payload).toBe(false);
			expect("instance_type" in payload).toBe(false);
		});

		test("should parse memory with different units correctly", () => {
			// Test MB unit
			let payload = buildProvisionPayload(
				{ memory: "2048MB" },
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);
			expect(payload.memory).toBe(2048);

			// Test GB unit
			payload = buildProvisionPayload(
				{ memory: "4GB" },
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);
			expect(payload.memory).toBe(4096);

			// Test G shorthand
			payload = buildProvisionPayload(
				{ memory: "2G" },
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);
			expect(payload.memory).toBe(2048);

			// Test numeric only (defaults to MB)
			payload = buildProvisionPayload(
				{ memory: "1024" },
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);
			expect(payload.memory).toBe(1024);
		});
	});

	describe("privacy settings", () => {
		test("should include public_logs and public_sysinfo in compose_file", () => {
			const options = {};
			const privacySettings = {
				publicLogs: true,
				publicSysinfo: false,
				listed: true,
			};

			const payload = buildProvisionPayload(
				options,
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				privacySettings,
			);

			expect(
				(payload.compose_file as Record<string, unknown>).public_logs,
			).toBe(true);
			expect(
				(payload.compose_file as Record<string, unknown>).public_sysinfo,
			).toBe(false);
			expect(payload.listed).toBe(true);
		});

		test("should include default privacy settings", () => {
			const options = {};

			const payload = buildProvisionPayload(
				options,
				defaultName,
				defaultDockerCompose,
				defaultEnvs,
				defaultPrivacySettings,
			);

			expect(
				(payload.compose_file as Record<string, unknown>).public_logs,
			).toBe(false);
			expect(
				(payload.compose_file as Record<string, unknown>).public_sysinfo,
			).toBe(true);
			expect(payload.listed).toBe(false);
		});
	});
});
