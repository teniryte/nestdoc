import { File } from '../files/file';
import { Node } from '../nodes/node';
import { uniqueId } from '../util';
import { NamedInterface } from './named.interface';

export class Linked implements NamedInterface {
  uid: number;
  parent: any = null;

  constructor() {
    this.uid = uniqueId();
  }

  getName() {
    return '';
  }

  getLinkId() {
    return this.parent.getName() + '-' + this.getName();
  }

  get linkId() {
    return this.getLinkId();
  }
}
