import { Node } from './node';

export class ParameterNode extends Node {
  nodeType = 'parameter';

  getPath(): string {
    return this.name;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      comment: this.comment?.toJSON() || {},
    };
  }
}
