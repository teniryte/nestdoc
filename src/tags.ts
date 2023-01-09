export const tags = [
  {
    name: 'description',
    parse(lines, comment): any {
      return {
        description: lines.join('\n'),
      };
    },
  },
  {
    name: 'args',
    parse(lines, comment) {
      return {
        args: lines
          .map(val => val.trim())
          .map(val => {
            if (val.startsWith('-')) return val.slice(1).trim();
            return val;
          })
          .map(val => {
            const name = val.split(':')[0];
            const description = val.split(':').slice(1).join(':');
            return { name, description };
          }),
      };
    },
  },
  {
    name: 'param',
    re: /\@param([\s\S]+?)/gim,
    parse(lines, comment, data) {
      const line = lines[0].trim();
      const type = line.split(' ')[0].slice(1, -1);
      const name = line.split(' ')[1];
      const description = line.split(' ').slice(2).join(' ');
      return {
        args: [
          ...(data.args || []),
          {
            name,
            type,
            description: description,
          },
        ],
      };
    },
  },
  {
    name: 'returns',
    re: /\@returns([\s\S]+?)/gim,
    parse(lines, comment) {
      return {
        returns: lines.join('\n'),
      };
    },
  },
  {
    name: 'example',
    parse(lines, comment) {
      return {
        example: lines.join('\n'),
      };
    },
  },
  {
    name: 'author',
    parse(lines, comment) {
      return {
        author: lines.join('\n'),
      };
    },
  },
  {
    name: 'deprecated',
    parse() {
      return {
        deprecated: true,
      };
    },
  },
  {
    name: 'throws',
    parse(lines, comment, data) {
      const name = lines[0].split('(')[0];
      const id = comment.file.getImportPath(name);
      return {
        throws: [
          ...(data.throws || []),
          {
            name: name,
            id: id,
            value: lines.join('\n'),
          },
        ],
      };
    },
  },
  {
    name: 'todo',
    parse(lines, comment) {
      return {
        todo: lines
          .map(val => val.trim())
          .map(val => {
            if (val.startsWith('-')) return val.slice(1).trim();
            return val;
          }),
      };
    },
  },
];
