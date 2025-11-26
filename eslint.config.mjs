import eslintConfig from '@electron-toolkit/eslint-config'
import vuePlugin from 'eslint-plugin-vue'
import importPlugin from 'eslint-plugin-import'
import vueParser from 'vue-eslint-parser'

export default [
  // workaround: vite config can't be linted correctly
  { ignores: ['node_modules', 'dist', 'out', 'electron.vite.config.js', 'vite.config.js'] },
  eslintConfig,
  importPlugin.flatConfigs.recommended,
  ...vuePlugin.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        extraFileExtensions: ['.vue']
      },
    },
  },
  {
    files: ['**/*.{js,jsx,vue}'],
    languageOptions: {
      ecmaVersion: 2020,
    },
    rules: {
      'vue/require-default-prop': 'off',
      'vue/multi-word-component-names': 'off',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      semi: ['error', 'never', {
        beforeStatementContinuationChars: 'never',
      }],

      'no-unexpected-multiline': 'error',
      'arrow-parens': 'off',

      'import/no-extraneous-dependencies': ['error', {
        devDependencies: true,
      }],
    },
  },
]
