import { FunctionNode } from './function.node';
import { Node } from './node';
import { ParameterNode } from './parameter.node';
import { PropertyNode } from './property.node';

export class MethodNode extends FunctionNode {
  nodeType = 'method';
  isAbstract: boolean;
  visibility: number;
  isOptional: boolean;
  isStatic: boolean;

  constructor(data: any, parent: any) {
    super(data, parent);

    this.isAbstract = data.isAbstract;
    this.visibility = data.visibility;
    this.isOptional = data.isOptional;
    this.isStatic = data.isStatic;
  }

  toJSON() {
    // console.log('METHOD', this);
    const args = this.parameters.map(parameter => parameter.toJSON());
    const comment = this.comment?.toJSON() || {};
    const params = [];
    if (comment && comment.args) {
      comment.args.forEach(arg => {
        const a: any = args.find(a => a.name === arg.name);
        let desc = arg.description;
        if (arg.description.includes(':')) {
          desc = arg.description.split(':')[0];
          a.type = arg.description.split(':')[1];
        }
        a.description = desc;
      });
    }
    return {
      ...super.toJSON(),
      isAsync: this.isAsync || false,
      isAbstract: this.isAbstract || false,
      isOptional: this.isOptional || false,
      isStatic: this.isStatic || false,
      args: args,
      comment: comment,
      decorators: this.decorators?.map(dec => dec.toJSON()),
    };
  }
}
