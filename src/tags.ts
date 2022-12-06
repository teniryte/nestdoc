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
    name: 'return',
    re: /\@return([\s\S]+?)/gim,
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
