module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: [
        'airbnb',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: '@babel/eslint-parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
    },
    plugins: [
        'babel',
        'import',
        'promise',
        'sort-destructure-keys',
    ],
    rules: {
        'arrow-parens': 'off',
        camelcase: 'warn',
        'consistent-return': 'off',
        'comma-dangle': ['warn', 'always-multiline'],
        'function-paren-newline': ['warn', 'consistent'],
        'generator-star-spacing': 'off',
        'import/no-unresolved': ['error', {
            caseSensitive: false,
        }],
        indent: ['warn', 4, {
            ArrayExpression: 'first',
            CallExpression: { arguments: 'first' },
            flatTernaryExpressions: true,
            FunctionDeclaration: { parameters: 'first' },
            FunctionExpression: { parameters: 'first' },
            ignoreComments: true,
            ignoredNodes: [
                'ConditionalExpression',
            ],
            ImportDeclaration: 'first',
            MemberExpression: 1,
            ObjectExpression: 'first',
            SwitchCase: 1,
            VariableDeclarator: 'first',
        }],
        'max-len': ['warn', {
            code: 120,
            ignoreComments: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreUrls: true,
        }],
        'no-console': 'off',
        'no-else-return': ['warn', {
            allowElseIf: true,
        }],
        'no-multi-assign': 'off',
        'no-nested-ternary': 'off',
        'no-unneeded-ternary': 'warn',
        'no-unused-expressions': ['warn', {
            allowShortCircuit: true,
        }],
        'no-use-before-define': 'off',
        'promise/param-names': 'error',
        'promise/always-return': 'error',
        'promise/catch-or-return': 'error',
        'promise/no-native': 'off',
    },
};
