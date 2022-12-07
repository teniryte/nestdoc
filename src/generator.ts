import { Project } from './project';

export function generate(options) {
  const project = new Project(options.root, null, options);

  project
    .generate()
    .then(() => console.log('Docs generated!'))
    .catch(err => console.log(err));
}
