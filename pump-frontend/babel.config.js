module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage', // adds specific imports for polyfills when they are used in each file.
        modules: 'auto', // preserve ES modules.
        corejs: { version: 3, proposals: true }, // enable polyfilling of every proposal supported by core-js.
        targets: {
          node: 'current', // Ensures compatibility with the current Node.js version used by Jest.
        },
      },
    ],
  ],
  plugins: [
    '@babel/plugin-transform-runtime', // enables the re-use of Babel's injected helper code to save on codesize.
    '@vue/babel-plugin-jsx',
  ],
  exclude: [/core-js/],
};
