const { resolve } = require('path');

export const createConfig = project => ({
  mode: 'development',
  entry: resolve(__dirname, '../../assets/templates/src/index.js'),
  target: 'web',
  output: {
    path: resolve(project.output, 'js'),
    filename: 'app.bundle.js',
  },
});
