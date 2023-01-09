import { Project } from './project';
import * as chokidar from 'chokidar';
import { resolve } from 'path';

export function generate(options, cb = () => {}) {
  const project = new Project(options.root, null, options);

  project
    .generate()
    .then(() => {
      setTimeout(() => {
        console.log('\n\nDocs generated!');
        cb();
      }, 500);
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
