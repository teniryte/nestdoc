export class Project {
  constructor(public root: string, public output: string) {}

  async generate(): Promise<void> {
    console.log('GENERATE');
  }
}
