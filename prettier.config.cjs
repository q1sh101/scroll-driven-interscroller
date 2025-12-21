module.exports = {
  semi: true,
  tabWidth: 2,
  singleQuote: true,
  printWidth: 120,
  htmlWhitespaceSensitivity: 'ignore',
  plugins: ['prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.html',
      options: {
        printWidth: 500,
      },
    },
  ],
};