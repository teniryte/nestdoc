export class Decorator {
  type = 'decorator';
  name: string;
  args: string;
  start: number;
  end: number;
  parent: any;
  id: string;

  constructor(data: any, parent: any) {
    this.name = data.name;
    this.args = data.args;
    this.start = data.start;
    this.end = data.end;
    this.parent = parent;
    this.id = this.getId();
  }

  getId() {
    return this.parent.getImportPath(this.name);
  }

  toJSON() {
    return {
      name: this.name,
      args: this.args.replace(/«/gim, '(').replace(/»/gim, ')'),
      start: this.start,
      end: this.end,
      id: this.id,
    };
  }
}
