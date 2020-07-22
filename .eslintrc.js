module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ["@typescript-eslint", "jest"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:jest/recommended",
        "prettier",
        "prettier/@typescript-eslint",
    ],
    rules: {
        "no-console": "error",
        "no-alert": "error",
        "@typescript-eslint/unbound-method": "off",
    },
};
