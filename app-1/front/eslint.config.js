import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';

export default [
	{
		ignores: ['dist', 'node_modules'],
	},
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				console: 'readonly',
				process: 'readonly',
				localStorage: 'readonly',
				navigator: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
			},
		},
		plugins: {
			react,
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			'unused-imports': unusedImports,
		},
		rules: {
			...js.configs.recommended.rules,
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,

			'react/prop-types': 'off',
			'react/no-unescaped-entities': 'off',
			'react/no-unknown-property': ['error', { ignore: ['jsx'] }],
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',

			'unused-imports/no-unused-imports': 'error',

			'no-unused-vars': 'off',
			'prefer-const': 'error',
			'no-var': 'error',

			'no-use-before-define': [
				'error',
				{
					functions: false,
					classes: true,
					variables: true,
					allowNamedExports: false,
				},
			],
			'no-undef': 'error',
			'no-redeclare': 'error',
			'no-shadow': [
				'error',
				{
					builtinGlobals: false,
					hoist: 'functions',
					allow: ['resolve', 'reject', 'done', 'next', 'err', 'error', 'cb', 'callback'],
				},
			],
			'block-scoped-var': 'error',
			'no-implicit-globals': 'error',

			'padding-line-between-statements': [
				'warn',
				{ blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
				{ blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
				{ blankLine: 'always', prev: '*', next: ['return', 'if'] },
			],
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
	prettier,
];
