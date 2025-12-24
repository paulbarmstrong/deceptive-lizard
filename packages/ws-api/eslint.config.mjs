import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"

export default [
	{
		files: ["**/*.{js,mjs,cjs,ts}"],
		languageOptions: { globals: globals.browser },
        rules: {
            "@typescript-eslint/strict-boolean-expressions": "error"
        },
		languageOptions: {
			parserOptions: {
				ecmaVersion: 2021,
				sourceType: "module",
				project: "./tsconfig.json"
			}
		}
    },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"no-useless-escape": "off"
		}
	}
]