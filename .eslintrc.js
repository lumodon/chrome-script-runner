module.exports = {
  rules: {
    "no-unused-vars": ["error", {
      args: "after-used",
      argsIgnorePattern: "^_"
    }]
  },
  parserOptions: {
    ecmaVersion: 10,
    sourceType: "module",
    ecmaFeature: {
      jsx: true
    }
  },
  env: {
    es6: true,
    node: true,
    browser: true
  }
}
