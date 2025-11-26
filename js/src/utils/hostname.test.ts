import { describe, it, expect } from "vitest";
import {
  isValidHostname,
  convertToHostname,
  generateFallbackHostname,
  generateDefaultCvmName,
} from "./hostname";

describe("hostname utilities", () => {
  describe("isValidHostname", () => {
    describe("valid hostnames", () => {
      it("should accept simple lowercase hostname", () => {
        expect(isValidHostname("myapp")).toBe(true);
      });

      it("should accept hostname with hyphens", () => {
        expect(isValidHostname("my-app")).toBe(true);
        expect(isValidHostname("my-awesome-project")).toBe(true);
      });

      it("should accept hostname with numbers (not at start)", () => {
        expect(isValidHostname("myapp123")).toBe(true);
        expect(isValidHostname("app2024")).toBe(true);
      });

      it("should accept mixed case hostnames", () => {
        expect(isValidHostname("MyApp")).toBe(true);
        expect(isValidHostname("MyAwesomeProject")).toBe(true);
      });

      it("should reject single letter (too short)", () => {
        expect(isValidHostname("a")).toBe(false);
        expect(isValidHostname("Z")).toBe(false);
      });

      it("should accept max length hostname (63 chars)", () => {
        const maxLength = "a" + "b".repeat(61) + "c"; // 63 chars
        expect(maxLength.length).toBe(63);
        expect(isValidHostname(maxLength)).toBe(true);
      });
    });

    describe("invalid hostnames", () => {
      it("should reject hostname starting with number", () => {
        expect(isValidHostname("123app")).toBe(false);
        expect(isValidHostname("9myapp")).toBe(false);
      });

      it("should reject hostname starting with hyphen", () => {
        expect(isValidHostname("-myapp")).toBe(false);
      });

      it("should reject hostname ending with hyphen", () => {
        expect(isValidHostname("myapp-")).toBe(false);
        expect(isValidHostname("my-app-")).toBe(false);
      });

      it("should reject empty string", () => {
        expect(isValidHostname("")).toBe(false);
      });

      it("should reject non-string input", () => {
        expect(isValidHostname(null as any)).toBe(false);
        expect(isValidHostname(undefined as any)).toBe(false);
        expect(isValidHostname(123 as any)).toBe(false);
      });

      it("should reject hostname shorter than 5 chars", () => {
        expect(isValidHostname("a")).toBe(false);
        expect(isValidHostname("ab")).toBe(false);
        expect(isValidHostname("abc")).toBe(false);
        expect(isValidHostname("abcd")).toBe(false);
      });

      it("should accept hostname with 5+ chars", () => {
        expect(isValidHostname("abcde")).toBe(true);
        expect(isValidHostname("a-xyz")).toBe(true);
      });

      it("should reject hostname exceeding 63 chars", () => {
        const toolong = "a" + "b".repeat(63);
        expect(toolong.length).toBe(64);
        expect(isValidHostname(toolong)).toBe(false);
      });

      it("should reject hostname with special characters", () => {
        expect(isValidHostname("my@app")).toBe(false);
        expect(isValidHostname("my app")).toBe(false);
        expect(isValidHostname("my_app")).toBe(false);
        expect(isValidHostname("my.app")).toBe(false);
      });

      it("should reject hostname with consecutive hyphens", () => {
        expect(isValidHostname("my--app")).toBe(false);
      });

      it("should reject hostname with only hyphens", () => {
        expect(isValidHostname("-")).toBe(false);
        expect(isValidHostname("---")).toBe(false);
      });
    });
  });

  describe("convertToHostname", () => {
    describe("already valid hostnames", () => {
      it("should pass through valid hostnames unchanged", () => {
        expect(convertToHostname("my-app")).toBe("my-app");
        expect(convertToHostname("myapp")).toBe("myapp");
        expect(convertToHostname("app123")).toBe("app123");
      });
    });

    describe("camelCase conversion", () => {
      it("should convert camelCase to kebab-case", () => {
        expect(convertToHostname("MyApp")).toBe("my-app");
        expect(convertToHostname("myAwesomeProject")).toBe("my-awesome-project");
        expect(convertToHostname("MyAwesomeProject")).toBe("my-awesome-project");
      });

      it("should handle consecutive capitals", () => {
        expect(convertToHostname("HTTPServer")).toBe("httpserver");
        expect(convertToHostname("XMLParser")).toBe("xmlparser");
      });
    });

    describe("snake_case conversion", () => {
      it("should convert snake_case to kebab-case", () => {
        expect(convertToHostname("my_app")).toBe("my-app");
        expect(convertToHostname("my_python_project")).toBe("my-python-project");
      });

      it("should handle multiple underscores", () => {
        expect(convertToHostname("my__app")).toBe("my-app");
      });
    });

    describe("special characters and spaces", () => {
      it("should replace spaces with hyphens", () => {
        expect(convertToHostname("my app")).toBe("my-app");
        expect(convertToHostname("my awesome project")).toBe("my-awesome-project");
      });

      it("should remove special characters and replace with hyphens", () => {
        expect(convertToHostname("my@app")).toBe("my-app");
        expect(convertToHostname("my!app")).toBe("my-app");
        expect(convertToHostname("my.app")).toBe("my-app");
      });

      it("should clean up multiple special characters", () => {
        expect(convertToHostname("my!@#app")).toBe("my-app");
        // "app!!!" results in "app" which is < 5 chars, so prepend prefix
        expect(convertToHostname("app!!!")).toBe("dstack-app-app");
      });
    });

    describe("i18n characters", () => {
      it("should generate fallback for non-ASCII characters", () => {
        const result = convertToHostname("我的应用");
        expect(result).toMatch(/^dstack-app-[a-z0-9]+-[a-z0-9]+$/);
        expect(isValidHostname(result)).toBe(true);
      });

      it("should generate fallback for emoji", () => {
        // "app 🚀" → "app-" (emoji replaced) → "app" (cleanup) → "dstack-app-app" (< 5 chars)
        expect(convertToHostname("app 🚀")).toBe("dstack-app-app");
      });

      it("should handle mixed i18n and ASCII", () => {
        const result = convertToHostname("myapp_应用");
        // Should convert underscore and strip i18n
        expect(isValidHostname(result)).toBe(true);
      });
    });

    describe("length and normalization", () => {
      it("should handle hyphen cleanup", () => {
        // "_test_" results in "test" which is < 5 chars, so prepend prefix
        expect(convertToHostname("_test_")).toBe("dstack-app-test");

        // "-test-" results in "test" which is < 5 chars, so prepend prefix
        expect(convertToHostname("-test-")).toBe("dstack-app-test");

        // "--test--" results in "test" which is < 5 chars, so prepend prefix
        expect(convertToHostname("--test--")).toBe("dstack-app-test");
      });

      it("should prepend dstack-app- for numeric prefix", () => {
        expect(convertToHostname("123app")).toBe("dstack-app-123app");
        expect(convertToHostname("2024-project")).toBe("dstack-app-2024-project");
      });

      it("should generate fallback for very short input", () => {
        // "_" results in empty string (after cleanup), so generate random fallback
        const result1 = convertToHostname("_");
        expect(result1).toMatch(/^dstack-app-[a-z0-9]+-[a-z0-9]+$/);
        expect(isValidHostname(result1)).toBe(true);

        // "a" results in "a" (1 char) which is < 5 chars, so prepend prefix
        expect(convertToHostname("a")).toBe("dstack-app-a");
      });

      it("should truncate names exceeding 63 chars", () => {
        const longName = "my" + "a".repeat(70);
        const result = convertToHostname(longName);
        expect(result.length).toBeLessThanOrEqual(63);
        expect(isValidHostname(result)).toBe(true);
      });

      it("should handle truncation with hyphen cleanup", () => {
        const longName = "my-" + "a".repeat(70) + "-app";
        const result = convertToHostname(longName);
        expect(result.length).toBeLessThanOrEqual(63);
        expect(result).not.toMatch(/-$/); // No trailing hyphen
        expect(isValidHostname(result)).toBe(true);
      });
    });

    describe("combined transformations", () => {
      it("should handle camelCase with special characters", () => {
        expect(convertToHostname("MyApp@App")).toBe("my-app-app");
      });

      it("should handle snake_case with special characters", () => {
        expect(convertToHostname("my_app!@#_project")).toBe("my-app-project");
      });

      it("should handle mixed naming styles", () => {
        expect(convertToHostname("MyApp_Project-2024")).toBe("my-app-project-2024");
      });
    });

    describe("always returns valid hostnames", () => {
      it("should ensure all conversions are valid hostnames", () => {
        const testCases = [
          "MyAwesomeProject",
          "my_python_project",
          "我的应用",
          "my app!@#",
          "_test_",
          "123-app",
          "a" + "b".repeat(70),
        ];

        testCases.forEach((testCase) => {
          const result = convertToHostname(testCase);
          expect(isValidHostname(result)).toBe(
            true,
            `convertToHostname("${testCase}") = "${result}" is not valid`
          );
        });
      });
    });
  });

  describe("generateFallbackHostname", () => {
    it("should generate valid hostnames", () => {
      const result = generateFallbackHostname();
      expect(isValidHostname(result)).toBe(true);
    });

    it("should start with dstack-app-", () => {
      const result = generateFallbackHostname();
      expect(result).toMatch(/^dstack-app-/);
    });

    it("should have correct pattern", () => {
      const result = generateFallbackHostname();
      expect(result).toMatch(/^dstack-app-[a-z0-9]+-[a-z0-9]+$/);
    });

    it("should generate different results", () => {
      const results = new Set([
        generateFallbackHostname(),
        generateFallbackHostname(),
        generateFallbackHostname(),
      ]);
      expect(results.size).toBe(3); // Should be different
    });

    it("should not exceed 63 chars", () => {
      for (let i = 0; i < 10; i++) {
        const result = generateFallbackHostname();
        expect(result.length).toBeLessThanOrEqual(63);
      }
    });
  });

  describe("generateDefaultCvmName", () => {
    it("should generate valid hostnames with default prefix", () => {
      const result = generateDefaultCvmName();
      expect(isValidHostname(result)).toBe(true);
    });

    it("should use default prefix when not provided", () => {
      const result = generateDefaultCvmName();
      expect(result).toMatch(/^dstack-app-/);
    });

    it("should use custom prefix when provided", () => {
      const result = generateDefaultCvmName("my-project");
      expect(result).toMatch(/^my-project-/);
      expect(isValidHostname(result)).toBe(true);
    });

    it("should have format prefix-{5chars}", () => {
      const result = generateDefaultCvmName();
      const parts = result.split("-");
      expect(parts.length).toBeGreaterThanOrEqual(2);
      const randomPart = parts[parts.length - 1];
      expect(randomPart).toMatch(/^[a-z0-9]{5}$/);
    });

    it("should generate different names on each call", () => {
      const results = new Set([
        generateDefaultCvmName(),
        generateDefaultCvmName(),
        generateDefaultCvmName(),
      ]);
      expect(results.size).toBe(3);
    });

    it("should not exceed 63 chars with default prefix", () => {
      for (let i = 0; i < 10; i++) {
        const result = generateDefaultCvmName();
        expect(result.length).toBeLessThanOrEqual(63);
      }
    });

    it("should handle long custom prefix", () => {
      const longPrefix = "a".repeat(55);
      const result = generateDefaultCvmName(longPrefix);
      expect(result.length).toBeLessThanOrEqual(63);
      expect(isValidHostname(result)).toBe(true);
    });

    it("should handle prefix with hyphens", () => {
      const result = generateDefaultCvmName("my-awesome-project");
      expect(isValidHostname(result)).toBe(true);
      expect(result).toMatch(/^my-awesome-project-/);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const result = convertToHostname("");
      expect(isValidHostname(result)).toBe(true);
      expect(result).toMatch(/^dstack-app-/);
    });

    it("should handle whitespace-only string", () => {
      const result = convertToHostname("   ");
      expect(isValidHostname(result)).toBe(true);
    });

    it("should handle only special characters", () => {
      const result = convertToHostname("!@#$%^&*()");
      expect(isValidHostname(result)).toBe(true);
    });
  });
});
