#!/usr/bin/env node
'use strict';

const parseOptions = require('parse-options');
const path = require('path');
const { Project } = require('./project');
const chokidar = require('chokidar');
const nestdoc = require('./index');

const options = parseOptions(
  // Example pattern.
  // Contains two commands (command="copy", file="test.txt")
  // and three parameters (boolean minimize=true, number limit=5
  // and string exclude="node_modules")
  `root $output|o @watch|w $base|b $logo|l $favicon|fav|f`,
  process.argv,
  {
    root: val => path.resolve(process.cwd(), val || 'src'),
    output: val => path.resolve(process.cwd(), val || 'documentation'),
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
