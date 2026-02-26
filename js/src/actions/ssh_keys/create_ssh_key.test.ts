import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSshKey, safeCreateSshKey, CreateSshKeyRequestSchema } from "./create_ssh_key";
import type { Client } from "../../client";

describe("createSshKey", () => {
  let mockClient: Client;

  beforeEach(() => {
    mockClient = {
      post: vi.fn(),
    } as unknown as Client;
  });

  const mockSshKey = {
    id: "sshkey_abc",
    user_id: "usr_123",
    name: "my-laptop",
    public_key: "ssh-ed25519 AAAA...",
    fingerprint: "SHA256:abc123",
    key_type: "ssh-ed25519",
    source: "manual",
    key_metadata: null,
    last_synced_at: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  };

  describe("CreateSshKeyRequestSchema", () => {
    it("should validate valid request", () => {
      const result = CreateSshKeyRequestSchema.safeParse({
        name: "my-laptop",
        public_key: "ssh-ed25519 AAAA...",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const result = CreateSshKeyRequestSchema.safeParse({
        name: "",
        public_key: "ssh-ed25519 AAAA...",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty public_key", () => {
      const result = CreateSshKeyRequestSchema.safeParse({
        name: "my-laptop",
        public_key: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing fields", () => {
      const result = CreateSshKeyRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("createSshKey", () => {
    it("should call POST /user/ssh-keys", async () => {
      vi.mocked(mockClient.post).mockResolvedValue(mockSshKey);

      const result = await createSshKey(mockClient, {
        name: "my-laptop",
        public_key: "ssh-ed25519 AAAA...",
      });

      expect(mockClient.post).toHaveBeenCalledWith("/user/ssh-keys", {
        name: "my-laptop",
        public_key: "ssh-ed25519 AAAA...",
      });
      expect(result.id).toBe("sshkey_abc");
      expect(result.name).toBe("my-laptop");
    });

    it("should throw error for invalid request", async () => {
      await expect(createSshKey(mockClient, { name: "", public_key: "" })).rejects.toThrow();
    });
  });

  describe("safeCreateSshKey", () => {
    it("should return success result", async () => {
      vi.mocked(mockClient.post).mockResolvedValue(mockSshKey);

      const result = await safeCreateSshKey(mockClient, {
        name: "my-laptop",
        public_key: "ssh-ed25519 AAAA...",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("sshkey_abc");
      }
    });

    it("should return error result for invalid request", async () => {
      const result = await safeCreateSshKey(mockClient, { name: "", public_key: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error result for API failure", async () => {
      vi.mocked(mockClient.post).mockRejectedValue(new Error("API Error"));

      const result = await safeCreateSshKey(mockClient, {
        name: "my-laptop",
        public_key: "ssh-ed25519 AAAA...",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("API Error");
      }
    });
  });
});
