import { describe, it, expect, vi, beforeEach } from "vitest";
import { Client } from "../../client";
import { getCvmState, safeGetCvmState } from "./get_cvm_state";

describe("getCvmState", () => {
  let client: Client;

  beforeEach(() => {
    client = new Client({
      apiKey: "test-key",
      baseURL: "https://test-api.example.com",
    });
  });

  it("should fetch current CVM state", async () => {
    const mockState = {
      status: "running",
      derived_status: "running",
      vm_uuid: "vm-123",
      instance_id: "instance-456",
      uptime: "2h30m",
    };

    vi.spyOn(client, "get").mockResolvedValue(mockState);

    const result = await getCvmState(client, { id: "cvm-123" });

    expect(client.get).toHaveBeenCalledWith("/cvms/cvm-123/state");
    expect(result).toEqual(mockState);
  });

  it("should call API without target parameter (immediate mode)", async () => {
    const mockState = { status: "stopped", derived_status: "stopped" };
    vi.spyOn(client, "get").mockResolvedValue(mockState);

    await getCvmState(client, { id: "cvm-456" });

    // Verify no query parameters are added
    expect(client.get).toHaveBeenCalledWith("/cvms/cvm-456/state");
  });

  describe("safeGetCvmState", () => {
    it("should return success result", async () => {
      const mockState = { status: "running", derived_status: "running" };
      vi.spyOn(client, "get").mockResolvedValue(mockState);

      const result = await safeGetCvmState(client, { id: "cvm-123" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockState);
      }
    });

    it("should return error result on failure", async () => {
      const error = new Error("Network error");
      vi.spyOn(client, "get").mockRejectedValue(error);

      const result = await safeGetCvmState(client, { id: "cvm-123" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Network error");
      }
    });
  });
});
