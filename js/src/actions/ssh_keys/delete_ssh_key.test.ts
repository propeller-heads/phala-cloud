import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteSshKey, safeDeleteSshKey, DeleteSshKeyRequestSchema } from "./delete_ssh_key";
import type { Client } from "../../client";

describe("deleteSshKey", () => {
  let mockClient: Client;

  beforeEach(() => {
    mockClient = {
      delete: vi.fn(),
    } as unknown as Client;
  });

  describe("DeleteSshKeyRequestSchema", () => {
    it("should validate valid request", () => {
      const result = DeleteSshKeyRequestSchema.safeParse({ keyId: "sshkey_abc" });
      expect(result.success).toBe(true);
    });

    it("should reject empty keyId", () => {
      const result = DeleteSshKeyRequestSchema.safeParse({ keyId: "" });
      expect(result.success).toBe(false);
    });

    it("should reject missing keyId", () => {
      const result = DeleteSshKeyRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("deleteSshKey", () => {
    it("should call DELETE /user/ssh-keys/{keyId}", async () => {
      vi.mocked(mockClient.delete).mockResolvedValue(undefined);

      const result = await deleteSshKey(mockClient, { keyId: "sshkey_abc" });

      expect(mockClient.delete).toHaveBeenCalledWith("/user/ssh-keys/sshkey_abc");
      expect(result).toBeUndefined();
    });

    it("should throw error for invalid keyId", async () => {
      await expect(deleteSshKey(mockClient, { keyId: "" })).rejects.toThrow();
    });
  });

  describe("safeDeleteSshKey", () => {
    it("should return success result", async () => {
      vi.mocked(mockClient.delete).mockResolvedValue(undefined);

      const result = await safeDeleteSshKey(mockClient, { keyId: "sshkey_abc" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });

    it("should return error result for invalid keyId", async () => {
      const result = await safeDeleteSshKey(mockClient, { keyId: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error result for API failure", async () => {
      vi.mocked(mockClient.delete).mockRejectedValue(new Error("API Error"));

      const result = await safeDeleteSshKey(mockClient, { keyId: "sshkey_abc" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("API Error");
      }
    });
  });
});
