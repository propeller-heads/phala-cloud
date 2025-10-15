import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteCvm, safeDeleteCvm, DeleteCvmRequestSchema } from "./delete_cvm";
import type { Client } from "../../client";

describe("deleteCvm", () => {
  let mockClient: Client;

  beforeEach(() => {
    mockClient = {
      delete: vi.fn(),
    } as unknown as Client;
  });

  describe("DeleteCvmRequestSchema", () => {
    it("should validate valid request", () => {
      const result = DeleteCvmRequestSchema.safeParse({ id: "test-cvm-id" });
      expect(result.success).toBe(true);
    });

    it("should reject empty id", () => {
      const result = DeleteCvmRequestSchema.safeParse({ id: "" });
      expect(result.success).toBe(false);
    });

    it("should reject missing id", () => {
      const result = DeleteCvmRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("deleteCvm", () => {
    it("should call DELETE /cvms/{id}", async () => {
      vi.mocked(mockClient.delete).mockResolvedValue(undefined);

      const result = await deleteCvm(mockClient, { id: "test-cvm-id" });

      expect(mockClient.delete).toHaveBeenCalledWith("/cvms/test-cvm-id");
      expect(result).toBeUndefined();
    });

    it("should throw error for invalid id", async () => {
      await expect(deleteCvm(mockClient, { id: "" })).rejects.toThrow();
    });
  });

  describe("safeDeleteCvm", () => {
    it("should return success result", async () => {
      vi.mocked(mockClient.delete).mockResolvedValue(undefined);

      const result = await safeDeleteCvm(mockClient, { id: "test-cvm-id" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });

    it("should return error result for invalid id", async () => {
      const result = await safeDeleteCvm(mockClient, { id: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error result for API failure", async () => {
      vi.mocked(mockClient.delete).mockRejectedValue(new Error("API Error"));

      const result = await safeDeleteCvm(mockClient, { id: "test-cvm-id" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("API Error");
      }
    });
  });
});
