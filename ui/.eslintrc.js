module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  extends: [
    'plugin:react/recommended',
    'standard'
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'react'
  ],
  rules: {
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never'
      }
    ],
    'react/prop-types': 'off'
  }
}
