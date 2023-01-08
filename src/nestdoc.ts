import { resolve } from 'path';
import { Project } from './project';
import * as chokidar from 'chokidar';
import * as nestdoc from './index';

const parseOptions = require('parse-options');

const args = process.argv.slice(1);

const options = parseOptions(
  // Example pattern.
  // Contains two commands (command="copy", file="test.txt")
  // and three parameters (boolean minimize=true, number limit=5
  // and string exclude="node_modules")
  `path $input|i $output|o @watch|w $base|b $logo|l $favicon|fav|f`,
  args,
  {
    input: val => resolve(process.cwd(), val || 'src'),
    path: val => resolve(process.cwd(), val || 'src'),
    output: val => resolve(process.cwd(), val || 'documentation'),
    watch: val => val,
    base: val => {
      return val || '/';
    },
    logo: val => val,
    favicon: val => val,
    root: val => resolve(process.cwd(), val || 'src'),
  }
);

if (options.watch) {
  nestdoc.watch(options);
} else {
  nestdoc.generate(options, () => {
    process.exit(0);
  });
}
