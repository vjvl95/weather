module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          '../../../*',
          '../../entities/*',
          '../../features/*',
          '../../widgets/*',
          '../../pages/*',
        ],
      },
    ],
  },
};
