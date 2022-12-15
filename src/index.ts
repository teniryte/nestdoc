import { Project } from './project';
import * as chokidar from 'chokidar';
import { resolve } from 'path';

export function generate(options, cb = () => {}) {
  const project = new Project(options.root, null, options);

  project
    .generate()
    .then(() => {
      console.log('Docs generated!');
      cb();
      process.exit(0);
    })
    .catch(err => console.log(err));
}

export function watch(options) {
  generate(options);
  chokidar
    .watch(
      [
        options.root,
        resolve(__dirname, '../src'),
        resolve(__dirname, '../dist'),
      ],
      {
        ignoreInitial: true,
      }
    )
    .on('all', (event, path) => {
      console.log(`${event}: ${path}. Generating...`);
      generate(options);
    });
  console.log('Watching for changes...');
}
