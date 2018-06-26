module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/airbnb'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    "no-param-reassign": [2, { "props": false }],
    "function-paren-newline": [0],

    "indent": [0, 2, { "MemberExpression": "off" }],
    // "vue/script-indent": [1, 2, { "baseIndent": 0, "MemberExpression": "off" }],
    "camelcase": [0],
    "comma-dangle": [0],
    "padded-blocks": [0],
    "no-unused-vars": [1],
    "semi": [1]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
