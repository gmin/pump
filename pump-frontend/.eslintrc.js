module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    jest: true,
    browser: true,
    es2020: true,
  },
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended', 'prettier'],
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  plugins: ['import', '@typescript-eslint'],
  rules: {
    // JavaScript/TypeScript
    eqeqeq: 'error',
    'no-else-return': 'error',
    'no-underscore-dangle': 'off',
    'arrow-parens': ['error', 'always'],

    // TypeScript
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    // Vue
    'vue/multi-word-component-names': 'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'vue/attributes-order': [
      'error',
      {
        order: [
          'DEFINITION',
          'LIST_RENDERING',
          'CONDITIONALS',
          'RENDER_MODIFIERS',
          'GLOBAL',
          ['UNIQUE', 'SLOT'],
          'TWO_WAY_BINDING',
          'OTHER_DIRECTIVES',
          'OTHER_ATTR',
          'EVENTS',
          'CONTENT',
        ],
        alphabetical: false,
      },
    ],

    // Import
    'import/no-duplicates': 'error',
    'import/newline-after-import': ['error', { count: 1 }],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      },
    ],
  },
};
