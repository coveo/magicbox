/// <reference path="Grammars.ts" />
module Coveo.MagicBox.Grammars {
  export var NestedQuery: SubGrammar = {
    basicExpressions: ['NestedQuery'],
    grammars: {
      NestedQuery: '[[NestedField][Spaces?][Expressions]]',
      NestedField: '[[Field]]',
      FieldValue: ['NestedQuery']
    },
    include: [Field]
  }
}
