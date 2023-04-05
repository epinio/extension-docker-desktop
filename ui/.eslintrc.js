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
    curly: 'off',
    indent: 'off',
    quotes: 'off',
    semi: 'off',
    'dot-notation': 'off',
    'keyword-spacing': 'off',
    'no-tabs': 'off',
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'no-useless-return': 'off',
    'no-var': 'off',
    'object-curly-spacing': 'off',
    'object-property-newline': 'off',
    'object-shorthand': 'off',
    'padded-blocks': 'off',
    'space-infix-ops': 'off',
    'spaced-comment': 'off',
    'space-before-function-paren': 'off',
    'react/no-unescaped-entities': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off'
  }
}
