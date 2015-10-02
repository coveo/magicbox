/// <reference path="Grammars.ts" />
module Coveo.MagicBox.Grammars {
  export var Complete:SubGrammar = {
    include: [NestedQuery, QueryExtension, SubExpression, Field, Basic]
  }
}