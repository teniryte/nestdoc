import { VariableNode } from './variable.node';

export class EnumNode extends VariableNode {
  nodeType = 'enum';
  members: string[];

  constructor(data: any, parent: any) {
    super(data, parent);

    this.members = data.members;
  }
}
