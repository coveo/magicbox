/// <reference path="Grammars.ts" />
module Coveo.MagicBox.Grammars {
  export var Boolean:SubGrammar = {
    expressions: ['BooleanExpression'],
    grammars: {
      BooleanExpression: '[BooleanExpressionList+][BasicExpression]',
      BooleanExpressionList: '[BasicExpression][Spaces][BooleanOperator][Spaces]',
      BooleanOperator: /OR|AND/,
    }
  }
}