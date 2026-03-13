/**
 * Tests for envs update command schema and validation
 */

import { describe, test, expect } from "bun:test";
import { envsUpdateCommandSchema } from "./command";

describe("envsUpdateCommandSchema", () => {
	test("validates with env inputs", () => {
		const result = envsUpdateCommandSchema.safeParse({
			env: ["NODE_ENV=production"],
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.env).toEqual(["NODE_ENV=production"]);
		}
	});

	test("validates with encryptedEnv", () => {
		const result = envsUpdateCommandSchema.safeParse({
			encryptedEnv: "deadbeef1234",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.encryptedEnv).toBe("deadbeef1234");
		}
	});

	test("validates with neither env nor encryptedEnv (handler validates)", () => {
		const result = envsUpdateCommandSchema.safeParse({});

		expect(result.success).toBe(true);
	});

	test("validates with both env and encryptedEnv (handler validates mutual exclusion)", () => {
		const result = envsUpdateCommandSchema.safeParse({
			env: ["A=1"],
			encryptedEnv: "deadbeef",
		});

		// Schema allows both; the handler does the mutual exclusion check
		expect(result.success).toBe(true);
	});

	test("accepts optional privateKey", () => {
		const result = envsUpdateCommandSchema.safeParse({
			env: ["A=1"],
			privateKey: "0xdeadbeef",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.privateKey).toBe("0xdeadbeef");
		}
	});

	test("accepts optional rpcUrl", () => {
		const result = envsUpdateCommandSchema.safeParse({
			env: ["A=1"],
			rpcUrl: "https://rpc.example.com",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.rpcUrl).toBe("https://rpc.example.com");
		}
	});

	test("defaults interactive to false", () => {
		const result = envsUpdateCommandSchema.safeParse({
			env: ["A=1"],
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.interactive).toBe(false);
		}
	});

	test("accepts cvmId", () => {
		const result = envsUpdateCommandSchema.safeParse({
			env: ["A=1"],
			cvmId: "my-cvm",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.cvmId).toBe("my-cvm");
		}
	});
});
