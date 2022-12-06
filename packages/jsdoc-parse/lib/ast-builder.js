const _ = require('lodash');
const babelParser = require('@babel/parser');
const { log } = require('@jsdoc/util');

// Exported so we can use them in tests.
const parserOptions = (exports.parserOptions = {
  allowAwaitOutsideFunction: true,
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,
  allowUndeclaredExports: true,
  plugins: [
    'typescript',
    'decorators-legacy',
    // 'typescript',
    'decoratorAutoAccessors',
    'asyncGenerators',
    'bigInt',
    'classPrivateMethods',
    'classPrivateProperties',
    'classProperties',
    // [
    //   'decorators',
    //   {
    //     decoratorsBeforeExport: true,
    //   },
    // ],
    'doExpressions',
    'dynamicImport',
    'estree',
    'exportDefaultFrom',
    'exportNamespaceFrom',
    'functionBind',
    'functionSent',
    'importMeta',
    'jsx',
    'logicalAssignment',
    'nullishCoalescingOperator',
    'numericSeparator',
    'objectRestSpread',
    'optionalCatchBinding',
    'optionalChaining',
    [
      'pipelineOperator',
      {
        proposal: 'minimal',
      },
    ],
    'throwExpressions',
  ],
  ranges: true,
});

function parse(source, filename, sourceType) {
  let ast;
  const options = _.defaults({}, parserOptions, { sourceType });

  ast = babelParser.parse(source, { ...options, sourceFilename: filename });

  return ast;
}

// TODO: docs
class AstBuilder {
  // TODO: docs
  static build(source, filename, sourceType) {
    return parse(source, filename, sourceType);
  }
}
exports.AstBuilder = AstBuilder;
