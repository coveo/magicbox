/// <reference path="Grammars.ts" />
module Coveo.MagicBox.Grammars {
  export var Boolean:SubGrammar = {
    expressions: ['BooleanExpression'],
    grammars: {
      BooleanExpression: '[BasicExpression{2}BooleanSeparator]',
      BooleanSeparator: '[Spaces][BooleanOperator][Spaces]',
      BooleanOperator: /OR|AND/,
    }
  }
}