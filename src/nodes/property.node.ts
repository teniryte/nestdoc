import { Node } from './node';

export class PropertyNode extends Node {
  nodeType = 'property';
  visibility: number;
  isOptional: boolean;
  isStatic: boolean;

  constructor(data: any, parent: any) {
    super(data, parent);

    this.visibility = data.visibility;
    this.isOptional = data.isOptional;
    this.isStatic = data.isStatic;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      comment: this.comment?.toJSON() || {},
      decorators: this.decorators,
    };
  }
}
