import { Node } from './node';
import { ParameterNode } from './parameter.node';
import { VariableNode } from './variable.node';

export class FunctionNode extends Node {
  nodeType = 'function';
  isAsync: boolean;
  parameters: ParameterNode[];
  variables: VariableNode[];

  constructor(data: any, parent: any) {
    super(data, parent);

    this.isAsync = data.isAsync;
    this.parameters = data.parameters.map(data => Node.createNode(data, this));
    this.variables = data.variables.map(data => Node.createNode(data, this));
  }
}
