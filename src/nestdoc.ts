import { resolve } from 'path';
import { Project } from './project';
import * as chokidar from 'chokidar';
import * as nestdoc from './index';

const parseOptions = require('parse-options');

const options = parseOptions(
  // Example pattern.
  // Contains two commands (command="copy", file="test.txt")
  // and three parameters (boolean minimize=true, number limit=5
  // and string exclude="node_modules")
  `root $output|o @watch|w $base|b $logo|l $favicon|fav|f`,
  process.argv,
  {
    root: val => resolve(process.cwd(), val || 'src'),
    output: val => resolve(process.cwd(), val || 'documentation'),
    watch: val => val,
    base: val => val || '/',
    logo: val => val,
    favicon: val => val,
  }
);

if (options.watch) {
  nestdoc.watch(options);
} else {
  nestdoc.generate(options, () => {
    process.exit(0);
  });
}
