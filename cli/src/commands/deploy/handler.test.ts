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
			);

			expect(
				(payload.compose_file as Record<string, unknown>).allowed_envs,
			).toEqual([]);
		});
	});
});
