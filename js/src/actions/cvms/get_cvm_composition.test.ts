import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCvmComposition,
  safeGetCvmComposition,
  GetCvmCompositionRequestSchema,
} from "./get_cvm_composition";
import type { Client } from "../../client";

describe("getCvmComposition", () => {
  let mockClient: Client;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
    } as unknown as Client;
  });

  describe("GetCvmCompositionRequestSchema", () => {
    it("should validate valid request", () => {
      const result = GetCvmCompositionRequestSchema.safeParse({ id: "test-cvm-id" });
      expect(result.success).toBe(true);
    });

    it("should reject empty id", () => {
      const result = GetCvmCompositionRequestSchema.safeParse({ id: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("getCvmComposition", () => {
    it("should call GET /cvms/{id}/composition", async () => {
      const mockResponse = {
        is_online: true,
        is_public: true,
        error: null,
        docker_compose_file: "version: '3'\nservices:\n  app:\n    image: nginx",
        manifest_version: 1,
        version: "1.0.0",
        runner: "docker-compose",
        features: ["kms", "tproxy-net"],
        containers: [
          {
            id: "container-123",
            names: ["/app"],
            image: "nginx:latest",
            image_id: "sha256:abc123",
            command: "nginx -g daemon off;",
            state: "running",
            status: "Up 2 hours",
            log_endpoint: "https://logs.example.com/app",
          },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await getCvmComposition(mockClient, { id: "test-cvm-id" });

      expect(mockClient.get).toHaveBeenCalledWith("/cvms/test-cvm-id/composition");
      expect(result.is_online).toBe(true);
      expect(result.containers?.length).toBe(1);
      expect(result.containers?.[0].names).toEqual(["/app"]);
    });

    it("should throw error for invalid id", async () => {
      await expect(getCvmComposition(mockClient, { id: "" })).rejects.toThrow();
    });
  });

  describe("safeGetCvmComposition", () => {
    it("should return success result", async () => {
      const mockResponse = {
        is_online: true,
        is_public: true,
        error: null,
        docker_compose_file: null,
        manifest_version: null,
        version: null,
        runner: null,
        features: null,
        containers: [],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await safeGetCvmComposition(mockClient, { id: "test-cvm-id" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_online).toBe(true);
      }
    });

    it("should return error result for invalid id", async () => {
      const result = await safeGetCvmComposition(mockClient, { id: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});
