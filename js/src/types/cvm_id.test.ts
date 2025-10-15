import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  CvmIdObjectSchema,
  CvmIdBaseSchema,
  CvmIdSchema,
  refineCvmId,
  type CvmIdInput,
} from "./cvm_id";

describe("CvmIdObjectSchema", () => {
  it("should accept id field", () => {
    const result = CvmIdObjectSchema.safeParse({ id: "cvm-123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("cvm-123");
    }
  });

  it("should accept uuid field with dashes", () => {
    const uuid = "123e4567-e89b-42d3-a456-556642440000";
    const result = CvmIdObjectSchema.safeParse({ uuid });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe(uuid);
    }
  });

  it("should accept uuid field without dashes", () => {
    const uuid = "123e4567e89b42d3a456556642440000";
    const result = CvmIdObjectSchema.safeParse({ uuid });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe(uuid);
    }
  });

  it("should reject invalid uuid format", () => {
    const result = CvmIdObjectSchema.safeParse({ uuid: "invalid-uuid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Invalid UUID format");
    }
  });

  it("should accept app_id field", () => {
    const result = CvmIdObjectSchema.safeParse({ app_id: "abc123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.app_id).toBe("abc123");
    }
  });

  it("should accept instance_id field", () => {
    const result = CvmIdObjectSchema.safeParse({ instance_id: "def456" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.instance_id).toBe("def456");
    }
  });

  it("should accept empty object (no refinement yet)", () => {
    const result = CvmIdObjectSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept multiple identifier fields", () => {
    const result = CvmIdObjectSchema.safeParse({
      id: "cvm-123",
      uuid: "123e4567-e89b-42d3-a456-556642440000",
      app_id: "abc",
      instance_id: "def",
    });
    expect(result.success).toBe(true);
  });
});

describe("refineCvmId", () => {
  const TestSchema = refineCvmId(
    CvmIdObjectSchema.extend({
      name: z.string().optional(),
    })
  );

  it("should pass when at least one identifier is provided", () => {
    expect(TestSchema.safeParse({ id: "test", name: "My CVM" }).success).toBe(true);
    expect(TestSchema.safeParse({ uuid: "123e4567-e89b-42d3-a456-556642440000", name: "My CVM" }).success).toBe(true);
    expect(TestSchema.safeParse({ app_id: "abc" }).success).toBe(true);
    expect(TestSchema.safeParse({ instance_id: "def" }).success).toBe(true);
  });

  it("should fail when no identifier is provided", () => {
    const result = TestSchema.safeParse({ name: "My CVM" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("One of id, uuid, app_id, or instance_id must be provided");
    }
  });

  it("should fail on empty object", () => {
    const result = TestSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("One of id, uuid, app_id, or instance_id must be provided");
    }
  });

  it("should preserve extended fields", () => {
    const result = TestSchema.safeParse({ id: "test", name: "My CVM" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("test");
      expect(result.data.name).toBe("My CVM");
    }
  });
});

describe("CvmIdBaseSchema", () => {
  it("should require at least one identifier", () => {
    const result = CvmIdBaseSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("One of id, uuid, app_id, or instance_id must be provided");
    }
  });

  it("should accept valid identifiers", () => {
    expect(CvmIdBaseSchema.safeParse({ id: "test" }).success).toBe(true);
    expect(CvmIdBaseSchema.safeParse({ uuid: "123e4567-e89b-42d3-a456-556642440000" }).success).toBe(true);
    expect(CvmIdBaseSchema.safeParse({ app_id: "abc" }).success).toBe(true);
    expect(CvmIdBaseSchema.safeParse({ instance_id: "def" }).success).toBe(true);
  });
});

describe("CvmIdSchema", () => {
  describe("transformation logic", () => {
    it("should extract cvmId from id field", () => {
      const result = CvmIdSchema.parse({ id: "cvm-123" });
      expect(result.cvmId).toBe("cvm-123");
    });

    it("should remove dashes from uuid", () => {
      const result = CvmIdSchema.parse({ uuid: "123e4567-e89b-42d3-a456-556642440000" });
      expect(result.cvmId).toBe("123e4567e89b42d3a456556642440000");
    });

    it("should handle uuid without dashes", () => {
      const result = CvmIdSchema.parse({ uuid: "123e4567e89b42d3a456556642440000" });
      expect(result.cvmId).toBe("123e4567e89b42d3a456556642440000");
    });

    it("should add app_ prefix to app_id without prefix", () => {
      const result = CvmIdSchema.parse({ app_id: "abc123" });
      expect(result.cvmId).toBe("app_abc123");
    });

    it("should keep app_ prefix if already present", () => {
      const result = CvmIdSchema.parse({ app_id: "app_abc123" });
      expect(result.cvmId).toBe("app_abc123");
    });

    it("should add instance_ prefix to instance_id without prefix", () => {
      const result = CvmIdSchema.parse({ instance_id: "def456" });
      expect(result.cvmId).toBe("instance_def456");
    });

    it("should keep instance_ prefix if already present", () => {
      const result = CvmIdSchema.parse({ instance_id: "instance_def456" });
      expect(result.cvmId).toBe("instance_def456");
    });
  });

  describe("priority order", () => {
    it("should prioritize id over all others", () => {
      const result = CvmIdSchema.parse({
        id: "test-id",
        uuid: "123e4567-e89b-42d3-a456-556642440000",
        app_id: "abc",
        instance_id: "def",
      });
      expect(result.cvmId).toBe("test-id");
    });

    it("should prioritize uuid over app_id and instance_id", () => {
      const result = CvmIdSchema.parse({
        uuid: "123e4567-e89b-42d3-a456-556642440000",
        app_id: "abc",
        instance_id: "def",
      });
      expect(result.cvmId).toBe("123e4567e89b42d3a456556642440000");
    });

    it("should prioritize app_id over instance_id", () => {
      const result = CvmIdSchema.parse({
        app_id: "abc",
        instance_id: "def",
      });
      expect(result.cvmId).toBe("app_abc");
    });

    it("should use instance_id when it's the only one provided", () => {
      const result = CvmIdSchema.parse({ instance_id: "def" });
      expect(result.cvmId).toBe("instance_def");
    });
  });

  describe("validation", () => {
    it("should fail when no identifier is provided", () => {
      expect(() => CvmIdSchema.parse({})).toThrow();
    });

    it("should fail on invalid uuid", () => {
      expect(() => CvmIdSchema.parse({ uuid: "invalid" })).toThrow();
    });
  });
});

describe("CvmIdInput type", () => {
  it("should allow all identifier fields", () => {
    const input1: CvmIdInput = { id: "test" };
    const input2: CvmIdInput = { uuid: "123e4567-e89b-42d3-a456-556642440000" };
    const input3: CvmIdInput = { app_id: "abc" };
    const input4: CvmIdInput = { instance_id: "def" };
    const input5: CvmIdInput = {};

    expect(input1).toBeDefined();
    expect(input2).toBeDefined();
    expect(input3).toBeDefined();
    expect(input4).toBeDefined();
    expect(input5).toBeDefined();
  });

  it("should allow multiple fields", () => {
    const input: CvmIdInput = {
      id: "test",
      uuid: "123e4567-e89b-42d3-a456-556642440000",
      app_id: "abc",
      instance_id: "def",
    };
    expect(input).toBeDefined();
  });
});

describe("Integration with extend pattern", () => {
  it("should work with .extend() for request schemas", () => {
    const UpdateNameSchema = refineCvmId(
      CvmIdObjectSchema.extend({
        name: z.string().min(1, "Name is required"),
      })
    );

    const result = UpdateNameSchema.parse({
      id: "cvm-123",
      name: "New Name",
    });

    expect(result.id).toBe("cvm-123");
    expect(result.name).toBe("New Name");
  });

  it("should validate extended fields", () => {
    const UpdateNameSchema = refineCvmId(
      CvmIdObjectSchema.extend({
        name: z.string().min(1, "Name is required"),
      })
    );

    expect(() =>
      UpdateNameSchema.parse({
        id: "cvm-123",
        name: "",
      })
    ).toThrow();
  });

  it("should work with complex extended schemas", () => {
    const ComplexSchema = refineCvmId(
      CvmIdObjectSchema.extend({
        vcpu: z.number().optional(),
        memory: z.number().optional(),
        allow_restart: z.boolean().optional(),
      })
    );

    const result = ComplexSchema.parse({
      uuid: "123e4567-e89b-42d3-a456-556642440000",
      vcpu: 4,
      memory: 8192,
      allow_restart: true,
    });

    expect(result.uuid).toBe("123e4567-e89b-42d3-a456-556642440000");
    expect(result.vcpu).toBe(4);
    expect(result.memory).toBe(8192);
    expect(result.allow_restart).toBe(true);
  });
});
