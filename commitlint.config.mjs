// commitlint.config.mjs
// Conventional Commits validate karta hai — galat format pe commit block ho jaata hai
// Hinglish Guide:
//   feat:     Naya feature add kiya (MINOR bump: 0.1.0 → 0.2.0)
//   fix:      Bug theek kiya (PATCH bump: 0.1.0 → 0.1.1)
//   chore:    Maintenance kaam — test/lint/build (koi version bump nahi)
//   docs:     Documentation update (koi bump nahi)
//   style:    Formatting/whitespace fix (koi bump nahi)
//   refactor: Code restructure, no new feature (koi bump nahi)
//   test:     Test add/fix (koi bump nahi)
//   perf:     Performance improvement (PATCH bump)
//   security: Security fix (PATCH bump)
//   ci:       CI/CD config change (koi bump nahi)
//   build:    Build system change (koi bump nahi)

/** @type {import('@commitlint/types').UserConfig} */
const commitlintConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Type: feat, fix, chore etc. must be lowercase
    "type-case": [2, "always", "lower-case"],
    // Type is required
    "type-empty": [2, "never"],
    // Allowed types (project-specific: added 'security')
    "type-enum": [
      2,
      "always",
      [
        "feat",     // New feature
        "fix",      // Bug fix
        "chore",    // Maintenance (no user-facing change)
        "docs",     // Documentation only
        "style",    // Formatting, no logic change
        "refactor", // Code restructure, no feature change
        "test",     // Tests only
        "perf",     // Performance improvement
        "security", // Security fix/hardening
        "ci",       // CI/CD configuration
        "build",    // Build system / dependency update
        "revert",   // Revert a previous commit
      ],
    ],
    // Subject (message) must NOT be empty
    "subject-empty": [2, "never"],
    // Subject must NOT end with period
    "subject-full-stop": [2, "never", "."],
    // Subject min length: 10 chars (meaningful message likhna zaroori)
    "subject-min-length": [2, "always", 10],
    // Subject max length: 72 chars (git convention)
    "subject-max-length": [2, "always", 72],
    // Header max length: 100 chars
    "header-max-length": [2, "always", 100],
    // Body line max length: 200 chars (optional body)
    "body-max-line-length": [1, "always", 200],
  },
};

export default commitlintConfig;
