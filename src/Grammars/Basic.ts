/// <reference path="Grammars.ts" />
module Coveo.MagicBox.Grammars {
  export var Basic: SubGrammar = {
    basicExpressions: ['Word'],
    grammars: {
      DoubleQuoted: '"[NotDoubleQuote]"',
      NotDoubleQuote: /[^"]*/,
      Word: /[^ \(\),\."\{}\[\]<>\+\-@\/=][^ \(\),\."\{}\[\]<>\+\-\/]*/
    }
  }

}