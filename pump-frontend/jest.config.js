//https://canopas.com/vue-3-component-testing-with-jest-8b80a8a8946b

/** @type {import('jest').Config} */
module.exports = {
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  testEnvironment: 'jsdom',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'vue'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
};
