import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  syncGithubSshKeys,
  safeSyncGithubSshKeys,
  SyncGithubSshKeysResponseSchema,
} from "./sync_github_ssh_keys";
import type { Client } from "../../client";

describe("syncGithubSshKeys", () => {
  let mockClient: Client;

  beforeEach(() => {
    mockClient = {
      post: vi.fn(),
    } as unknown as Client;
  });

  const mockSyncResult = {
    synced_count: 3,
    keys_added: 2,
    keys_updated: 1,
    keys_removed: 0,
    errors: [],
  };

  describe("SyncGithubSshKeysResponseSchema", () => {
    it("should validate valid response", () => {
      const result = SyncGithubSshKeysResponseSchema.safeParse(mockSyncResult);
      expect(result.success).toBe(true);
    });

    it("should default errors to empty array", () => {
      const result = SyncGithubSshKeysResponseSchema.safeParse({
        synced_count: 1,
        keys_added: 1,
        keys_updated: 0,
        keys_removed: 0,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.errors).toEqual([]);
      }
    });

    it("should reject missing fields", () => {
      const result = SyncGithubSshKeysResponseSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("syncGithubSshKeys", () => {
    it("should call POST /user/ssh-keys/github-sync", async () => {
      vi.mocked(mockClient.post).mockResolvedValue(mockSyncResult);

      const result = await syncGithubSshKeys(mockClient);

      expect(mockClient.post).toHaveBeenCalledWith("/user/ssh-keys/github-sync", {});
      expect(result.synced_count).toBe(3);
      expect(result.keys_added).toBe(2);
    });
  });

  describe("safeSyncGithubSshKeys", () => {
    it("should return success result", async () => {
      vi.mocked(mockClient.post).mockResolvedValue(mockSyncResult);

      const result = await safeSyncGithubSshKeys(mockClient);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.synced_count).toBe(3);
      }
    });

    it("should return error result for API failure", async () => {
      vi.mocked(mockClient.post).mockRejectedValue(new Error("API Error"));

      const result = await safeSyncGithubSshKeys(mockClient);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("API Error");
      }
    });
  });
});
