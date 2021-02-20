const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const LicensePlugin = require('webpack-license-plugin');
const path = require('path');

const PROJECT_NAME = packageInfo.name;

module.exports = merge(common, {
    entry: {
      'license-gen': './license-gen/index.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist-discard/'),
    },
    plugins: [
      new LicensePlugin({
          excludedPackageTest: (packageName, version) => {
              return false;
          },
          outputFilename: `../dist/${PROJECT_NAME}/oss-licenses.json`
      })
    ]
});
