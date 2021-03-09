module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended", "google", "plugin:@typescript-eslint/recommended", "prettier"],
  rules: {
    "prettier/prettier": 2,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier"],
};
