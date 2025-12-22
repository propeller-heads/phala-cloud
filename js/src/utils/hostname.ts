/**
 * CVM Hostname/Name utilities
 *
 * RFC 1123 Hostname Format with Phala Cloud requirements:
 * - 5-63 characters (min 5 for generated names like "a-xyz")
 * - Must start with letter (a-z, A-Z)
 * - Can contain letters, numbers, and hyphens
 * - Cannot end with hyphen
 * - Cannot have consecutive hyphens
 * - Uppercase letters are auto-converted to lowercase by convertToHostname()
 *
 * Pattern: ^[a-zA-Z](?!.*--)([a-zA-Z0-9-]*[a-zA-Z0-9])?$
 * Note: Validator accepts both cases; conversion to lowercase happens in convertToHostname()
 */

/**
 * Validate hostname format (RFC 1123 with letter-first requirement)
 *
 * Accepts both uppercase and lowercase letters. Actual names should be normalized
 * using convertToHostname() before storing/display.
 *
 * @param name - Name to validate
 * @returns true if valid hostname format (5-63 chars, starts with letter, no consecutive hyphens)
 *
 * @example
 * isValidHostname("my-app")          // true
 * isValidHostname("MyApp")           // true (validator accepts uppercase)
 * isValidHostname("123app")          // false (starts with number)
 * isValidHostname("-app")            // false (starts with hyphen)
 * isValidHostname("app-")            // false (ends with hyphen)
 * isValidHostname("app--test")       // false (consecutive hyphens not allowed)
 */
export function isValidHostname(name: string): boolean {
  if (typeof name !== "string" || name.length < 5 || name.length > 63) {
    return false;
  }
  // Pattern: starts with letter, optionally contains letters/numbers/hyphens, ends with letter/number
  // Negative lookahead (?!.*--) ensures no consecutive hyphens
  return /^[a-zA-Z](?!.*--)([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(name);
}

/**
 * Convert any string to hostname-compliant format (RFC 1123)
 *
 * Handles multiple naming styles:
 * - camelCase: MyApp → my-app
 * - snake_case: my_app → my-app
 * - i18n chars: 我的应用 → fallback (dstack-app-{timestamp}-{random})
 * - special chars: my app!@# → my-app
 *
 * @param input - Input string to convert
 * @returns Valid hostname format (5-63 chars, RFC 1123)
 *
 * @example
 * convertToHostname("MyAwesomeProject")     // "my-awesome-project"
 * convertToHostname("my_python_project")    // "my-python-project"
 * convertToHostname("我的应用")              // "dstack-app-{timestamp}-{random}"
 * convertToHostname("test")                  // "dstack-app-test"
 */
export function convertToHostname(input: string): string {
  if (typeof input !== "string") {
    return generateFallbackHostname();
  }

  let result = input;

  // Step 1: Handle naming style normalization
  // camelCase: MyApp → my-App → my-app
  result = result
    .replace(/([a-z])([A-Z])/g, "$1-$2") // camelCase split
    .toLowerCase();

  // snake_case: my_app → my-app
  result = result.replace(/_/g, "-");

  // Step 2: Handle internationalization and special characters
  // Keep: letters (a-z, A-Z), numbers (0-9), hyphens, spaces
  // Replace: everything else with hyphens
  result = result
    .replace(/[^a-z0-9\s-]/gi, "-") // i18n chars, special symbols → hyphen
    .replace(/\s+/g, "-"); // spaces → hyphen

  // Step 3: Clean up and normalize
  result = result
    .replace(/-+/g, "-") // multiple hyphens → single hyphen
    .replace(/^-+/, "") // remove leading hyphens
    .replace(/-+$/, ""); // remove trailing hyphens

  // Step 4: Length and validity handling
  // If too short (< 1 char), generate fallback
  if (result.length === 0) {
    return generateFallbackHostname();
  }

  // If result is a number or starts with number, prepend dstack-app-
  if (/^\d/.test(result)) {
    result = `dstack-app-${result}`;
  }

  // If result is too short (< 5 chars), try to prepend prefix first
  // This preserves semantic meaning (e.g., "test" -> "dstack-app-test")
  if (result.length < 5) {
    result = `dstack-app-${result}`;
  }

  // Limit to 63 characters and ensure ends with letter/number (not hyphen)
  result = result.slice(0, 63).replace(/-+$/, "");

  // Fallback if result is empty after truncation
  if (result.length === 0) {
    return generateFallbackHostname();
  }

  // Final validation: must match RFC 1123 + letter-first requirement
  if (!isValidHostname(result)) {
    // Last resort fallback
    return generateFallbackHostname();
  }

  return result;
}

/**
 * Generate a random hostname with fallback pattern
 * Used when input cannot be reasonably converted
 *
 * Pattern: dstack-app-{base36-timestamp}-{random}
 * Example: dstack-app-1y8a2b3c-4d5e
 *
 * @returns Valid random hostname
 */
export function generateFallbackHostname(): string {
  const timestamp = Date.now().toString(36); // base36 for shorter string
  const random = Math.random().toString(36).substring(2, 6);
  return `dstack-app-${timestamp}-${random}`;
}

/**
 * Generate a default CVM name with prefix and random suffix
 *
 * Pattern: {prefix}-{random5chars}
 * - Always valid RFC 1123 format
 * - Easy to recognize (prefix + random)
 * - Consistent across platforms
 *
 * @param prefix - Descriptive prefix (default: "dstack-app")
 * @returns Valid CVM name
 *
 * @example
 * generateDefaultCvmName()                // "dstack-app-a1b2c"
 * generateDefaultCvmName("my-project")    // "my-project-x9y8z"
 */
export function generateDefaultCvmName(prefix = "dstack-app"): string {
  // Generate 5-char random string: a-z, 0-9
  const random = Array.from(
    { length: 5 },
    () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)],
  ).join("");

  const result = `${prefix}-${random}`;

  // Ensure result is valid and within length limits
  if (result.length > 63) {
    // If prefix is too long, use shorter random
    const shortRandom = Array.from(
      { length: 3 },
      () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)],
    ).join("");
    return `${prefix.slice(0, 55)}-${shortRandom}`;
  }

  return result;
}
