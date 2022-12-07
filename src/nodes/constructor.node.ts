import { FunctionNode } from './function.node';
import { MethodNode } from './method.node';
import { Node } from './node';

export class ConstructorNode extends MethodNode {
  nodeType = 'constructor';

  constructor(data: any, parent: any) {
    super(data, parent);
  }

  toJSON() {
    return {
      ...super.toJSON(),
    };
  }
}
