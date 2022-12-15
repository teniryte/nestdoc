import * as fs from 'fs';
import * as path from 'path';
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
  TypescriptParser,
  VariableDeclaration,
} from 'typescript-parser';

const STATE = {
  counter: 0,
};

export const uniqueId = () => {
  STATE.counter = STATE.counter + 1;
  return STATE.counter;
};

export const getAllFiles = (dirPath, arrayOfFiles = []): string[] => {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, '/', file));
    }
  });

  return arrayOfFiles;
};

export const removeComments = string => {
  //Takes a string of code, not an actual function.
  return string
    .replace(/\/\*([\s\S]*?)\*\/|\/\/.*/g, txt => {
      return txt.replace(/\@/gim, 'D');
    })
    .trim(); //Strip comments
};

export const findClosingBracketMatchIndex = (str, pos) => {
  if (str[pos] != '(') {
    throw new Error("No '(' at index " + pos);
  }
  let depth = 1;
  for (let i = pos + 1; i < str.length; i++) {
    switch (str[i]) {
      case '(':
        depth++;
        break;
      case ')':
        if (--depth == 0) {
          return i;
        }
        break;
    }
  }
  return -1; // No matching closing parenthesis
};

export const getDeclarationType = (item: any) => {
  if (item instanceof ClassDeclaration) {
    return 'class';
  }
  if (item instanceof PropertyDeclaration) {
    return 'property';
  }
  if (item instanceof MethodDeclaration) {
    return 'method';
  }
  if (item instanceof ParameterDeclaration) {
    return 'parameter';
  }
  if (item instanceof VariableDeclaration) {
    return 'variable';
  }
  if (item instanceof ConstructorDeclaration) {
    return 'constructor';
  }
  if (item instanceof EnumDeclaration) {
    return 'enum';
  }
  if (item instanceof GetterDeclaration) {
    return 'getter';
  }
  if (item instanceof SetterDeclaration) {
    return 'setter';
  }
  if (item instanceof InterfaceDeclaration) {
    return 'interface';
  }
};
