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

  it("should accept name field with valid RFC 1123 format", () => {
    const result = CvmIdObjectSchema.safeParse({ name: "my-app" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("my-app");
    }
  });

  it("should accept name field with uppercase letters", () => {
    const result = CvmIdObjectSchema.safeParse({ name: "MyApp" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("MyApp");
    }
  });

  it("should reject name field with invalid format (too short)", () => {
    const result = CvmIdObjectSchema.safeParse({ name: "app" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("5-63 characters");
    }
  });

  it("should reject name field with invalid format (starts with number)", () => {
    const result = CvmIdObjectSchema.safeParse({ name: "123app" });
    expect(result.success).toBe(false);
  });

  it("should reject name field with invalid format (ends with hyphen)", () => {
    const result = CvmIdObjectSchema.safeParse({ name: "my-app-" });
    expect(result.success).toBe(false);
  });

  it("should reject name field with consecutive hyphens", () => {
    const result = CvmIdObjectSchema.safeParse({ name: "my--app" });
    expect(result.success).toBe(false);
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

  it("should pass when valid name is provided", () => {
    // Note: TestSchema extends with a simple z.string() name field (no RFC 1123 validation)
    // So any string including "My CVM" will pass the TestSchema
    const result = TestSchema.safeParse({ name: "My CVM" });
    expect(result.success).toBe(true);

    const validResult = TestSchema.safeParse({ name: "my-cvm-name" });
    expect(validResult.success).toBe(true);
  });

  it("should fail when no identifier is provided", () => {
    const result = TestSchema.safeParse({ other_field: "value" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("One of id, uuid, app_id, instance_id, or name must be provided");
    }
  });

  it("should fail on empty object", () => {
    const result = TestSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("One of id, uuid, app_id, instance_id, or name must be provided");
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
      expect(result.error.issues[0].message).toContain("One of id, uuid, app_id, instance_id, or name must be provided");
    }
  });

  it("should accept valid identifiers", () => {
    expect(CvmIdBaseSchema.safeParse({ id: "test" }).success).toBe(true);
    expect(CvmIdBaseSchema.safeParse({ uuid: "123e4567-e89b-42d3-a456-556642440000" }).success).toBe(true);
    expect(CvmIdBaseSchema.safeParse({ app_id: "abc" }).success).toBe(true);
    expect(CvmIdBaseSchema.safeParse({ instance_id: "def" }).success).toBe(true);
    expect(CvmIdBaseSchema.safeParse({ name: "my-app-name" }).success).toBe(true);
  });
});

describe("CvmIdSchema", () => {
  describe("transformation logic", () => {
    it("should extract cvmId from id field (custom format)", () => {
      const result = CvmIdSchema.parse({ id: "cvm-123" });
      expect(result.cvmId).toBe("cvm-123");
    });

    it("should remove dashes from uuid field", () => {
      const result = CvmIdSchema.parse({ uuid: "123e4567-e89b-42d3-a456-556642440000" });
      expect(result.cvmId).toBe("123e4567e89b42d3a456556642440000");
    });

    it("should handle uuid without dashes", () => {
      const result = CvmIdSchema.parse({ uuid: "123e4567e89b42d3a456556642440000" });
      expect(result.cvmId).toBe("123e4567e89b42d3a456556642440000");
    });

    it("should add app_ prefix to 40-char hex app_id", () => {
      const result = CvmIdSchema.parse({ app_id: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
      expect(result.cvmId).toBe("app_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    });

    it("should keep app_ prefix if already present", () => {
      const result = CvmIdSchema.parse({ app_id: "app_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
      expect(result.cvmId).toBe("app_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    });

    it("should use custom app_id as-is if not 40-char hex", () => {
      const result = CvmIdSchema.parse({ app_id: "custom-app-123" });
      expect(result.cvmId).toBe("custom-app-123");
    });

    it("should use custom instance_id as-is (no auto-prefix)", () => {
      const result = CvmIdSchema.parse({ instance_id: "custom-instance-456" });
      expect(result.cvmId).toBe("custom-instance-456");
    });

    it("should keep instance_ prefix if already present", () => {
      const result = CvmIdSchema.parse({ instance_id: "instance_def456" });
      expect(result.cvmId).toBe("instance_def456");
    });
  });

  describe("auto-detection across different fields", () => {
    it("should detect UUID in id field and remove dashes", () => {
      const result = CvmIdSchema.parse({ id: "123e4567-e89b-42d3-a456-556642440000" });
      expect(result.cvmId).toBe("123e4567e89b42d3a456556642440000");
    });

    it("should detect 40-char hex in id field and add app_ prefix", () => {
      const result = CvmIdSchema.parse({ id: "50b0e827cc6c53f4010b57e588a18c5ef9388cc1" });
      expect(result.cvmId).toBe("app_50b0e827cc6c53f4010b57e588a18c5ef9388cc1");
    });

    it("should detect UUID in app_id field (user mistake) and remove dashes", () => {
      const result = CvmIdSchema.parse({ app_id: "123e4567-e89b-42d3-a456-556642440000" });
      expect(result.cvmId).toBe("123e4567e89b42d3a456556642440000");
    });

    it("should detect 40-char hex in id field when user is confused", () => {
      // Note: uuid field has regex validation, so we can't test "wrong field" scenario there
      // But we can test that id field properly detects 40-char hex
      const result = CvmIdSchema.parse({ id: "cccccccccccccccccccccccccccccccccccccccc" });
      expect(result.cvmId).toBe("app_cccccccccccccccccccccccccccccccccccccccc");
    });

    it("should detect 40-char hex in instance_id field and add app_ prefix", () => {
      const result = CvmIdSchema.parse({ instance_id: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" });
      expect(result.cvmId).toBe("app_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
    });

    it("should handle already prefixed app_id in id field", () => {
      const result = CvmIdSchema.parse({ id: "app_50b0e827cc6c53f4010b57e588a18c5ef9388cc1" });
      expect(result.cvmId).toBe("app_50b0e827cc6c53f4010b57e588a18c5ef9388cc1");
    });

    it("should handle already prefixed instance_id in id field", () => {
      const result = CvmIdSchema.parse({ id: "instance_def456" });
      expect(result.cvmId).toBe("instance_def456");
    });
  });

  describe("name field transformation", () => {
    it("should use name field as-is without conversion", () => {
      const result = CvmIdSchema.parse({ name: "my-app" });
      expect(result.cvmId).toBe("my-app");
    });

    it("should support name with uppercase letters", () => {
      const result = CvmIdSchema.parse({ name: "MyApp" });
      expect(result.cvmId).toBe("MyApp");
    });

    it("should support name with numbers", () => {
      const result = CvmIdSchema.parse({ name: "app123" });
      expect(result.cvmId).toBe("app123");
    });

    it("should support name that looks like UUID but starts with letter", () => {
      const result = CvmIdSchema.parse({ name: "a50e8400-e29b-41d4-a716-446655440000" });
      expect(result.cvmId).toBe("a50e8400-e29b-41d4-a716-446655440000");
      // Note: Backend will auto-detect this as UUID via is_known_identifier_format()
    });

    it("should use name via id field (backward compatibility)", () => {
      const result = CvmIdSchema.parse({ id: "my-app-name" });
      expect(result.cvmId).toBe("my-app-name");
      // id field doesn't match UUID/app_id patterns, passes through as-is
    });
  });

  describe("priority order", () => {
    it("should prioritize id over all others including name", () => {
      const result = CvmIdSchema.parse({
        id: "test-id",
        uuid: "123e4567-e89b-42d3-a456-556642440000",
        app_id: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        instance_id: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        name: "my-app-name",
      });
      expect(result.cvmId).toBe("test-id");
    });

    it("should prioritize uuid over app_id, instance_id, and name", () => {
      const result = CvmIdSchema.parse({
        uuid: "123e4567-e89b-42d3-a456-556642440000",
        app_id: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        instance_id: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        name: "my-app-name",
      });
      expect(result.cvmId).toBe("123e4567e89b42d3a456556642440000");
    });

    it("should prioritize app_id over instance_id and name", () => {
      const result = CvmIdSchema.parse({
        app_id: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        instance_id: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        name: "my-app-name",
      });
      expect(result.cvmId).toBe("app_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    });

    it("should prioritize instance_id over name", () => {
      const result = CvmIdSchema.parse({
        instance_id: "custom-instance",
        name: "my-app-name",
      });
      expect(result.cvmId).toBe("custom-instance");
    });

    it("should use name when it's the only one provided", () => {
      const result = CvmIdSchema.parse({ name: "my-app-name" });
      expect(result.cvmId).toBe("my-app-name");
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
    const input5: CvmIdInput = { name: "my-app" };
    const input6: CvmIdInput = {};

    expect(input1).toBeDefined();
    expect(input2).toBeDefined();
    expect(input3).toBeDefined();
    expect(input4).toBeDefined();
    expect(input5).toBeDefined();
    expect(input6).toBeDefined();
  });

  it("should allow multiple fields", () => {
    const input: CvmIdInput = {
      id: "test",
      uuid: "123e4567-e89b-42d3-a456-556642440000",
      app_id: "abc",
      instance_id: "def",
      name: "my-app",
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
