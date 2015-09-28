/// <reference path="Grammars.ts" />
module Coveo.MagicBox.Grammars {
  export var Complete:SubGrammar = {
    include: [SubExpression, Field, Basic]
  }
}