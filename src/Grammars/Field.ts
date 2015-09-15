/// <reference path="Grammars.ts" />
module Coveo.MagicBox.Grammars {
  export var Field:SubGrammar = {
    basicExpressions: ['FieldQuery', 'Field'],
    grammars: {
      FieldQuery: '[Field][Spaces?][FieldOperator][Spaces?][FieldValue]',
      Field: '@[FieldName]',
      FieldName: /[a-zA-Z][a-zA-Z0-9\.]*/,
      FieldOperator: /==|=|<>/,
      FieldValue: ['FieldValueList', 'FieldValueString'],
      FieldValueString: ['DoubleQuoted', 'Word'],
      FieldValueList: '([FieldValueString+FieldValueSeparator])',
      FieldValueSeparator: / *, */,
    },
    include: [Basic]
  }
}