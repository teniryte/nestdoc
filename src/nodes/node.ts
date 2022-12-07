import {
  ClassDeclaration,
  ConstructorDeclaration,
  EnumDeclaration,
  GetterDeclaration,
  InterfaceDeclaration,
  MethodDeclaration,
  ParameterDeclaration,
  PropertyDeclaration,
  SetterDeclaration,
  VariableDeclaration,
} from 'typescript-parser';
import { Comment } from '../comment';
import { Decorator } from '../decorator';
import { File } from '../files/file';
import { Linked } from '../types/linked';
import { NamedInterface } from '../types/named.interface';
import { uniqueId } from '../util';

export class Node extends Linked implements NamedInterface {
  parent: File | Node;
  name: string;
  start: number;
  end: number;
  comment: Comment;
  type: string;
  decorators: Decorator[];
  id: string;
  generic = null;
  uid: number;

  static createNode(data: any, parent: any): Node {
    const ClassNode = require('./class.node').ClassNode;
    const PropertyNode = require('./property.node').PropertyNode;
    const MethodNode = require('./method.node').MethodNode;
    const ParameterNode = require('./parameter.node').ParameterNode;
    const VariableNode = require('./variable.node').VariableNode;
    const ConstructorNode = require('./constructor.node').ConstructorNode;
    const EnumNode = require('./enum.node').EnumNode;
    const GetterNode = require('./getter.node').GetterNode;
    const SetterNode = require('./setter.node').SetterNode;
    const InterfaceNode = require('./interface.node').InterfaceNode;
    if (data instanceof ClassDeclaration) {
      return new ClassNode(data, parent);
    }
    if (data instanceof PropertyDeclaration) {
      return new PropertyNode(data, parent);
    }
    if (data instanceof MethodDeclaration) {
      return new MethodNode(data, parent);
    }
    if (data instanceof ParameterDeclaration) {
      const node = new ParameterNode(data, parent);
      return node;
    }
    if (data instanceof VariableDeclaration) {
      return new VariableNode(data, parent);
    }
    if (data instanceof ConstructorDeclaration) {
      return new ConstructorNode(data, parent);
    }
    if (data instanceof EnumDeclaration) {
      return new EnumNode(data, parent);
    }
    if (data instanceof GetterDeclaration) {
      return new GetterNode(data, parent);
    }
    if (data instanceof SetterDeclaration) {
      return new SetterNode(data, parent);
    }
    if (data instanceof InterfaceDeclaration) {
      return new InterfaceNode(data, parent);
    }
  }

  constructor(data: any, parent: any) {
    super(parent);
    this.name = data.name;
    this.start = data.start;
    this.end = data.end;
    this.comment = data.comment || null;
    this.type = data.type || null;
    if (data.type && data.type.includes('<')) {
      this.type = data.type.split('<')[0];
      this.generic = data.type.split('<')[1].split('>')[0];
    }
    this.parent = parent || null;
    this.decorators = data.decorators;
    this.id = this.getId();
    this.uid = uniqueId();
  }

  toJSON() {
    return {
      name: this.name,
      start: this.start,
      end: this.end,
      type: this.type,
      generic: this.generic,
      id: this.getId(),
    };
  }

  getName(): string {
    return this.name;
  }

  getFile(): File {
    let parent = this.parent;
    while (parent && !(parent instanceof File)) {
      parent = parent.parent;
    }
    return parent as File;
  }

  getId() {
    return (
      this.getFile().getImportPath(this.type) ||
      this.getFile().getImportPath(this.name)
    );
  }
}
