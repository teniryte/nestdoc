import { FunctionNode } from './function.node';
import { Node } from './node';

export class ConstructorNode extends FunctionNode {
  nodeType = 'constructor';

  constructor(data: any, parent: any) {
    super(data, parent);
  }
}
