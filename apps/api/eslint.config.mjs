import security from "eslint-plugin-security";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["node_modules/**", "dist/**"],
  },
  // Use base TS config for parsing, not strict rules (can tighten later)
  ...tseslint.configs.recommended,
  security.configs.recommended,
  {
    // Relax strict TS rules for now - focus on security scanning
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
);

