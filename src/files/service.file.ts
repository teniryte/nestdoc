import { basename, extname } from 'path';
import { ClassDeclaration } from 'typescript-parser';
import { File } from './file';
import { Module } from '../module';

export class ServiceFile extends File {
  fileType = 'service';

  toJSON() {
    return {
      ...super.toJSON(),
    };
  }
}
