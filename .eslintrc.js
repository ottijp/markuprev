module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    semi: ['error', 'never', { beforeStatementContinuationChars: 'never' }],
    'no-unexpected-multiline': 'error',
    'arrow-parens': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  },
}
