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
}
