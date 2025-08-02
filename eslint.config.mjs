import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow any types
      "@typescript-eslint/no-explicit-any": "off",
      
      // Allow unused variables
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      
      // Allow unescaped entities in JSX
      "react/no-unescaped-entities": "off",
      
      // Allow let instead of const
      "prefer-const": "warn",
      
      // Allow missing dependencies in useEffect
      "react-hooks/exhaustive-deps": "warn",
      
      // Allow img tags instead of Next.js Image
      "@next/next/no-img-element": "warn",
    },
  },
];

export default eslintConfig;
