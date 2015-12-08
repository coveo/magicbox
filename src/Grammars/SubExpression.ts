/// <reference path="Grammars.ts" />
module Coveo.MagicBox.Grammars {
  export var SubExpression:SubGrammar = {
    basicExpressions: ['SubExpression'],
    grammars: {
      SubExpression: '([Expressions])'
    }
  }
}
