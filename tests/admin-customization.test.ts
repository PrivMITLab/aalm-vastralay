/**
 * 👑 AALM VASTRALAY — ADMIN ZERO-CODE CUSTOMIZATION TEST SUITE
 * Validates that all site settings (branding, theme, banners, commerce,
 * security, feature switches) are valid, load without error, and
 * deserialize safely from JSON/lists without breaking the storefront.
 */

import { SETTINGS_FIELDS, SETTINGS_GROUPS } from "../src/lib/settings-defs";

export async function testAdminCustomization() {
  console.log("  ▶ Running Admin Zero-Code Customization Tests...");

  // 1. Validate SETTINGS_GROUPS
  const expectedGroupIds = ["brand", "theme", "home", "commerce", "seller", "security", "features"];
  const actualGroupIds: string[] = SETTINGS_GROUPS.map((g) => g.id);

  for (const exp of expectedGroupIds) {
    if (!actualGroupIds.includes(exp)) {
      throw new Error(`Failed: Missing settings group '${exp}' in SETTINGS_GROUPS`);
    }
  }

  // 2. Validate SETTINGS_FIELDS catalog
  if (SETTINGS_FIELDS.length < 30) {
    throw new Error(`Failed: Expected comprehensive settings list, got only ${SETTINGS_FIELDS.length} fields`);
  }

  const seenKeys = new Set<string>();
  for (const field of SETTINGS_FIELDS) {
    // Check unique key
    if (seenKeys.has(field.key)) {
      throw new Error(`Failed: Duplicate setting key detected: '${field.key}'`);
    }
    seenKeys.add(field.key);

    // Check valid group
    if (!actualGroupIds.includes(field.group)) {
      throw new Error(`Failed: Setting '${field.key}' belongs to unknown group '${field.group}'`);
    }

    // Check default exists
    if (typeof field.default !== "string") {
      throw new Error(`Failed: Setting '${field.key}' has non-string default value`);
    }

    // If type is json, verify default parses cleanly
    if (field.type === "json") {
      try {
        const parsed = JSON.parse(field.default);
        if (typeof parsed !== "object" || parsed === null) {
          throw new Error(`Failed: JSON setting '${field.key}' does not parse to an object or array`);
        }
      } catch (err) {
        throw new Error(`Failed: Invalid JSON default in setting '${field.key}': ${err}`);
      }
    }

    // If type is select, verify options exist and default is one of them
    if (field.type === "select") {
      if (!field.options || !field.options.length) {
        throw new Error(`Failed: Select setting '${field.key}' has no options defined`);
      }
      if (!field.options.includes(field.default)) {
        throw new Error(`Failed: Default '${field.default}' for '${field.key}' is not in options list`);
      }
    }
  }

  // 3. Specific Critical Settings Verification
  const criticalKeys = [
    "site.name",
    "site.announcements",
    "site.phone",
    "site.whatsapp",
    "theme.primary",
    "theme.accent",
    "home.bannerUrl",
    "home.bannerTitle",
    "commerce.currencySymbol",
    "commerce.freeShippingThreshold",
    "features.reviews",
  ];

  for (const k of criticalKeys) {
    if (!seenKeys.has(k)) {
      throw new Error(`Failed: Critical customization setting '${k}' is missing!`);
    }
  }

  console.log(`  ✔ Verified all ${SETTINGS_FIELDS.length} zero-code admin settings & JSON safety!`);
}
