require('dotenv').config();

module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['src/**/*.ts'],
    paths: ['features/**/*.feature'],
    format: ['progress-bar', 'allure-cucumberjs/reporter'],
    formatOptions: { resultsDir: 'allure-results' },
    parallel: Number(process.env.PARALLEL ?? 1),
    publishQuiet: true,
  },
};
