/// <reference path="Grammars.ts" />
module Coveo.MagicBox.Grammars {
  export var Complete:SubGrammar = {
    include: [Boolean, SubExpression, Field, Basic]
  }
}