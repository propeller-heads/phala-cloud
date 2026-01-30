/**
 * Integration tests for getCurrentUser
 *
 * These tests are designed to run against a real API server in development environment.
 * They are NOT included in automated CI to avoid external dependencies.
 *
 * To run these tests:
 * 1. Set PHALA_CLOUD_API_KEY environment variable
 * 2. Optionally set PHALA_CLOUD_API_PREFIX (defaults to production server)
 * 3. Run: npm run test:integration or vitest getCurrentUser.integration.test.ts
 *
 * Example:
 * ```bash
 * export PHALA_CLOUD_API_KEY="your-api-key"
 * export PHALA_CLOUD_API_PREFIX="https://staging-api.phala.network/v1"
 * npm run test:integration
 * ```
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "../client";
import { getCurrentUser, safeGetCurrentUser } from "./get_current_user";

// Skip integration tests if no API key is provided
const TEST_API_KEY = process.env.PHALA_CLOUD_API_KEY;
const TEST_BASE_URL = process.env.PHALA_CLOUD_API_PREFIX;

const skipIntegrationTests = !TEST_API_KEY;

describe.skipIf(skipIntegrationTests)("getCurrentUser Integration Tests", () => {
  let client: ReturnType<typeof createClient>;

  beforeAll(() => {
    if (!TEST_API_KEY) {
      throw new Error("PHALA_CLOUD_API_KEY environment variable is required for integration tests");
    }

    // Client will automatically read environment variables
    client = createClient({
      timeout: 30000, // 30 seconds for network calls
    });

    console.log(`Running integration tests against: ${client.config.baseURL}`);
  });

  describe("getCurrentUser - Real API (v20260121)", () => {
    it("should fetch real user data in three-layer format", async () => {
      const result = await getCurrentUser(client);

      // Validate three-layer structure
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.workspace).toBeDefined();
      expect(result.credits).toBeDefined();

      // User layer
      expect(typeof result.user.username).toBe("string");
      expect(typeof result.user.email).toBe("string");
      expect(typeof result.user.role).toBe("string");
      expect(typeof result.user.avatar).toBe("string");
      expect(typeof result.user.email_verified).toBe("boolean");
      expect(typeof result.user.totp_enabled).toBe("boolean");
      expect(typeof result.user.backup_codes_count).toBe("number");

      // Workspace layer
      expect(typeof result.workspace.id).toBe("string");
      expect(typeof result.workspace.name).toBe("string");
      expect(typeof result.workspace.tier).toBe("string");
      expect(typeof result.workspace.role).toBe("string");

      // Credits layer
      expect(typeof result.credits.balance).toBe("number");
      expect(typeof result.credits.granted_balance).toBe("number");
      expect(typeof result.credits.is_post_paid).toBe("boolean");

      // Log results for debugging
      console.log("✅ User data fetched successfully:", {
        username: result.user.username,
        email: result.user.email,
        workspace: result.workspace.name,
        tier: result.workspace.tier,
        balance: result.credits.balance,
      });
    }, 30000); // 30 second timeout

    it("should handle invalid API key gracefully", async () => {
      const invalidClient = createClient({
        apiKey: "invalid-api-key",
      });

      await expect(getCurrentUser(invalidClient)).rejects.toThrow();
    }, 15000);
  });

  describe("safeGetCurrentUser - Real API", () => {
    it("should return success result with real data", async () => {
      const result = await safeGetCurrentUser(client);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toBeDefined();
        expect(typeof result.data.user.username).toBe("string");
        expect(typeof result.data.user.email).toBe("string");
        expect(typeof result.data.workspace.name).toBe("string");
        expect(typeof result.data.credits.balance).toBe("number");

        console.log("✅ Safe user data fetched successfully:", {
          username: result.data.user.username,
          email: result.data.user.email,
          workspace: result.data.workspace.name,
        });
      }
    }, 30000);

    it("should return error result with invalid API key", async () => {
      const invalidClient = createClient({
        apiKey: "invalid-api-key",
      });

      const result = await safeGetCurrentUser(invalidClient);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.message).toBeDefined();

        console.log("✅ Error handled correctly:", result.error.message);
      }
    }, 15000);
  });

  describe("API Token Validation", () => {
    it("should validate API token correctly", async () => {
      // This is the primary use case - validating if API token is valid
      const result = await safeGetCurrentUser(client);

      if (result.success) {
        console.log("✅ API Token is valid for user:", result.data.user.username);
        expect(result.data.user.username).toBeDefined();
        expect(result.data.user.username.length).toBeGreaterThan(0);
      } else {
        console.log("❌ API Token validation failed:", result.error.message);
        throw new Error(`API Token validation failed: ${result.error.message}`);
      }
    }, 30000);
  });
});

// Show helpful message when integration tests are skipped
if (skipIntegrationTests) {
  console.log(`
⚠️  Integration tests skipped!

To run integration tests:
1. Set PHALA_CLOUD_API_KEY environment variable with a valid API key
2. Optionally set PHALA_CLOUD_API_PREFIX (defaults to production)
3. Run: vitest getCurrentUser.integration.test.ts

Example:
export PHALA_CLOUD_API_KEY="your-api-key"
export PHALA_CLOUD_API_PREFIX="https://staging-api.phala.network/v1"
vitest getCurrentUser.integration.test.ts
  `);
}
