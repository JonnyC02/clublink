const js = require('@eslint/js');
const eslintPluginReact = require('eslint-plugin-react');
const eslintPluginTypeScript = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: parser,
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        browser: true,
        node: true,
        es2021: true,
        document: 'readonly',
        HTMLElement: 'readonly',
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
      },
    },
    plugins: {
      react: eslintPluginReact,
      '@typescript-eslint': eslintPluginTypeScript,
    },
    rules: {
      ...js.configs.recommended.rules,

      ...eslintPluginReact.configs.recommended.rules,

      ...eslintPluginTypeScript.configs.recommended.rules,

      'no-console': 'warn',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    ignores: ['node_modules/', 'backend/dist/**', 'backend/build/**', 'frontend/build/**'],
  },
];