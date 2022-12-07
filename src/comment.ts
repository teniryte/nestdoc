import { File } from './files/file';
import { tags } from './tags';

export class Comment {
  type = 'CommentBlock';
  data: any;

  constructor(
    public source: string,
    public start: number,
    public lastIndex: number,
    public file: File
  ) {
    this.data = this.parse();
  }

  toJSON() {
    return this.data;
  }

  parse(): any {
    const data = {};
    let str = this.source
      .split('\n')
      .map(val => val.trim())
      .map(val => {
        if (val.startsWith('*')) return val.slice(1).trim();
        return val;
      })
      .join('\n')
      .trim();
    const items = {};
    let lines = [];
    let itemName = 'description';
    str
      .split('\n')
      .map(val => val.trim())
      .filter(val => !!val)
      .forEach(line => {
        if (line.startsWith('@')) {
          items[itemName] = items[itemName] || [];
          items[itemName].push({
            name: itemName,
            lines: lines.map(val => val.trim()).filter(val => !!val),
            code: lines
              .map(val => val.trim())
              .filter(val => !!val)
              .join('\n'),
          });
          lines = [];
          itemName = line.slice(1).split(' ')[0];
          line = line.split(' ').slice(1).join(' ');
        }
        lines.push(line);
      });
    items[itemName] = items[itemName] || [];
    items[itemName].push({
      name: itemName,
      lines: lines.map(val => val.trim()).filter(val => !!val),
      code: lines
        .map(val => val.trim())
        .filter(val => !!val)
        .join('\n'),
    });
    tags.forEach(tag => {
      const handlers = items[tag.name];
      if (!handlers || !handlers.length) return;
      handlers.forEach(item => {
        Object.assign(data, tag.parse(item.lines, this, data));
      });
    });
    return data;
  }
}
