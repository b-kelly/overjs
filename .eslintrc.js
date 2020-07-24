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
        // turn off the regular rule in favor of the "experimental" rule (for jsx support)
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars-experimental": ["warn"],
    },
};
