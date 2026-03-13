/**
 * Tests for envs encrypt command schema and validation
 */

import { describe, test, expect } from "bun:test";
import { envsEncryptCommandSchema } from "./command";

describe("envsEncryptCommandSchema", () => {
	test("validates with env inputs", () => {
		const result = envsEncryptCommandSchema.safeParse({
			env: ["NODE_ENV=production"],
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.env).toEqual(["NODE_ENV=production"]);
			expect(result.data.interactive).toBe(false);
		}
	});

	test("validates with multiple env inputs", () => {
		const result = envsEncryptCommandSchema.safeParse({
			env: [".env", "SECRET=abc", "API_KEY=xyz"],
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.env).toHaveLength(3);
		}
	});

	test("rejects empty env array", () => {
		const result = envsEncryptCommandSchema.safeParse({
			env: [],
		});

		expect(result.success).toBe(false);
	});

	test("rejects missing env", () => {
		const result = envsEncryptCommandSchema.safeParse({});

		expect(result.success).toBe(false);
	});

	test("accepts optional cvmId", () => {
		const result = envsEncryptCommandSchema.safeParse({
			env: ["A=1"],
			cvmId: "app_abc123",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.cvmId).toBe("app_abc123");
		}
	});

	test("defaults interactive to false", () => {
		const result = envsEncryptCommandSchema.safeParse({
			env: ["A=1"],
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.interactive).toBe(false);
		}
	});

	test("defaults noNewline to false", () => {
		const result = envsEncryptCommandSchema.safeParse({
			env: ["A=1"],
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.noNewline).toBe(false);
		}
	});

	test("accepts noNewline flag", () => {
		const result = envsEncryptCommandSchema.safeParse({
			env: ["A=1"],
			noNewline: true,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.noNewline).toBe(true);
		}
	});
});
