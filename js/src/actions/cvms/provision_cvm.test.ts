import { describe, it, expect } from "vitest";
import { ProvisionCvmRequestSchema } from "./provision_cvm";

describe("ProvisionCvmRequestSchema", () => {
  describe("manual nonce specification", () => {
    it("should accept nonce and app_id fields", () => {
      const input = {
        name: "test-app",
        instance_type: "tdx.small",
        compose_file: {
          docker_compose_file: "version: '3'\nservices:\n  app:\n    image: nginx",
        },
        kms: "PHALA" as const,
        nonce: 5,
        app_id: "0x97b33782AEeB23974b7b4839BB22cCF8F11Cd83e",
      };

      const result = ProvisionCvmRequestSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nonce).toBe(5);
        expect(result.data.app_id).toBe("0x97b33782AEeB23974b7b4839BB22cCF8F11Cd83e");
      }
    });

    it("should accept request without nonce/app_id (auto-generate)", () => {
      const input = {
        name: "test-app",
        instance_type: "tdx.small",
        compose_file: {
          docker_compose_file: "version: '3'\nservices:\n  app:\n    image: nginx",
        },
      };

      const result = ProvisionCvmRequestSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nonce).toBeUndefined();
        expect(result.data.app_id).toBeUndefined();
      }
    });

    it("should accept nonce as number type", () => {
      const input = {
        name: "test-app",
        compose_file: {
          docker_compose_file: "version: '3'\nservices:\n  app:\n    image: nginx",
        },
        nonce: 0,
        app_id: "0xFCd8E7d731E613c92f428501686B74C7De7Fa95C",
      };

      const result = ProvisionCvmRequestSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nonce).toBe(0);
      }
    });
  });

  describe("backward compatibility", () => {
    it("should still accept traditional requests without nonce fields", () => {
      const input = {
        name: "test-app",
        instance_type: "tdx.small",
        compose_file: {
          docker_compose_file: "version: '3'\nservices:\n  app:\n    image: nginx",
        },
        node_id: 123,
        region: "us-east",
      };

      const result = ProvisionCvmRequestSchema.safeParse(input);

      expect(result.success).toBe(true);
    });
  });

  describe("smart default for instance_type", () => {
    const baseInput = {
      name: "test-app",
      compose_file: {
        docker_compose_file: "version: '3'\nservices:\n  app:\n    image: nginx",
      },
    };

    it("should default to tdx.small when no resource params specified", () => {
      const result = ProvisionCvmRequestSchema.safeParse(baseInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.instance_type).toBe("tdx.small");
        expect(result.data.vcpu).toBeUndefined();
        expect(result.data.memory).toBeUndefined();
      }
    });

    it("should NOT set default instance_type when vcpu is specified", () => {
      const input = { ...baseInput, vcpu: 4 };

      const result = ProvisionCvmRequestSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.instance_type).toBeUndefined();
        expect(result.data.vcpu).toBe(4);
      }
    });

    it("should NOT set default instance_type when memory is specified", () => {
      const input = { ...baseInput, memory: 8192 };

      const result = ProvisionCvmRequestSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.instance_type).toBeUndefined();
        expect(result.data.memory).toBe(8192);
      }
    });

    it("should NOT set default instance_type when both vcpu and memory are specified", () => {
      const input = { ...baseInput, vcpu: 4, memory: 8192 };

      const result = ProvisionCvmRequestSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.instance_type).toBeUndefined();
        expect(result.data.vcpu).toBe(4);
        expect(result.data.memory).toBe(8192);
      }
    });

    it("should use explicit instance_type when specified", () => {
      const input = { ...baseInput, instance_type: "tdx.large" };

      const result = ProvisionCvmRequestSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.instance_type).toBe("tdx.large");
      }
    });

    it("should use explicit instance_type even when vcpu/memory are also specified", () => {
      const input = { ...baseInput, instance_type: "tdx.medium", vcpu: 4, memory: 8192 };

      const result = ProvisionCvmRequestSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.instance_type).toBe("tdx.medium");
        expect(result.data.vcpu).toBe(4);
        expect(result.data.memory).toBe(8192);
      }
    });
  });
});
