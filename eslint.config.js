import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import solid from 'eslint-plugin-solid/configs/typescript'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'preview/dist', 'playwright-report', 'test-results'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    ...solid,
  },
  {
    files: ['scripts/**/*.{js,mjs,cjs}', 'create-a4ui/*.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
  // The scaffolder's templates are standalone app files (they import the
  // published `@a4ui/core`), not part of this repo's source — don't lint them.
  {
    ignores: ['create-a4ui/templates'],
  },
  prettier,
)
