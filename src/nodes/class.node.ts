import { ConstructorNode } from './constructor.node';
import { MethodNode } from './method.node';
import { Node } from './node';
import { PropertyNode } from './property.node';
import { VariableNode } from './variable.node';

export class ClassNode extends VariableNode {
  nodeType = 'class';
  accessors: any;
  properties: PropertyNode[];
  methods: MethodNode[];
  constr: ConstructorNode;

  constructor(public data: any, public parent: any) {
    super(data, parent);

    this.properties = data.properties.map(data => Node.createNode(data, this));
    this.methods = data.methods.map(data => Node.createNode(data, this));
    this.constr = Node.createNode(data.ctor, this) as ConstructorNode;

    this.accessors = data.accessors;
  }

  toJSON() {
    // if (this.name === 'AdminService') {
    //   console.log('CLASS', this);
    // }
    const comment = this.comment?.data || {};
    return {
      ...super.toJSON(),
      uid: this.uid,
      name: this.name,
      comment,
      decorators: this.decorators.map(dec => dec.toJSON()),
      constr: this.constr?.toJSON(),
      properties: this.properties.map(property => property.toJSON()),
      methods: this.methods.map(method => method.toJSON()),
    };
  }
}
