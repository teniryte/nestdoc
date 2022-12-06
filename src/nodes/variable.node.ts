import { Node } from './node';

export class VariableNode extends Node {
  variable = 'constructor';
  isExported: boolean;

  constructor(data: any, parent: any) {
    super(data, parent);

    this.isExported = data.isExported;
  }
}
