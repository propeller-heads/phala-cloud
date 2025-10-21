import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCvmStats, safeGetCvmStats, GetCvmStatsRequestSchema } from "./get_cvm_stats";
import type { Client } from "../../client";

describe("getCvmStats", () => {
  let mockClient: Client;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
    } as unknown as Client;
  });

  describe("GetCvmStatsRequestSchema", () => {
    it("should validate valid request", () => {
      const result = GetCvmStatsRequestSchema.safeParse({ id: "test-cvm-id" });
      expect(result.success).toBe(true);
    });

    it("should reject empty id", () => {
      const result = GetCvmStatsRequestSchema.safeParse({ id: "" });
      expect(result.success).toBe(false);
    });

    it("should reject missing id", () => {
      const result = GetCvmStatsRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("getCvmStats", () => {
    it("should call GET /cvms/{id}/stats", async () => {
      const mockResponse = {
        is_online: true,
        is_public: true,
        error: null,
        sysinfo: {
          os_name: "Ubuntu",
          os_version: "22.04",
          kernel_version: "5.15.0",
          cpu_model: "Intel Xeon",
          num_cpus: 4,
          total_memory: 8589934592,
          available_memory: 6442450944,
          used_memory: 2147483648,
          free_memory: 6442450944,
          total_swap: 0,
          used_swap: 0,
          free_swap: 0,
          uptime: 3600,
          loadavg_one: 0.5,
          loadavg_five: 0.3,
          loadavg_fifteen: 0.2,
          disks: [
            {
              name: "/dev/vda1",
              mount_point: "/",
              total_size: 21474836480,
              free_size: 15032385536,
            },
          ],
        },
        status: "running",
        in_progress: false,
        boot_progress: null,
        boot_error: null,
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await getCvmStats(mockClient, { id: "test-cvm-id" });

      expect(mockClient.get).toHaveBeenCalledWith("/cvms/test-cvm-id/stats");
      expect(result.is_online).toBe(true);
      expect(result.sysinfo?.cpu_model).toBe("Intel Xeon");
    });

    it("should throw error for invalid id", async () => {
      await expect(getCvmStats(mockClient, { id: "" })).rejects.toThrow();
    });
  });

  describe("safeGetCvmStats", () => {
    it("should return success result", async () => {
      const mockResponse = {
        is_online: true,
        is_public: true,
        error: null,
        sysinfo: {
          os_name: "Ubuntu",
          os_version: "22.04",
          kernel_version: "5.15.0",
          cpu_model: "Intel Xeon",
          num_cpus: 4,
          total_memory: 8589934592,
          available_memory: 6442450944,
          used_memory: 2147483648,
          free_memory: 6442450944,
          total_swap: 0,
          used_swap: 0,
          free_swap: 0,
          uptime: 3600,
          loadavg_one: 0.5,
          loadavg_five: 0.3,
          loadavg_fifteen: 0.2,
          disks: [],
        },
        status: "running",
        in_progress: false,
        boot_progress: null,
        boot_error: null,
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await safeGetCvmStats(mockClient, { id: "test-cvm-id" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_online).toBe(true);
      }
    });

    it("should return error result for invalid id", async () => {
      const result = await safeGetCvmStats(mockClient, { id: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error result for API failure", async () => {
      vi.mocked(mockClient.get).mockRejectedValue(new Error("API Error"));

      const result = await safeGetCvmStats(mockClient, { id: "test-cvm-id" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("API Error");
      }
    });
  });
});
