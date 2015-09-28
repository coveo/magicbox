/// <reference path="Grammars.ts" />
module Coveo.MagicBox.Grammars {
  export var Field:SubGrammar = {
    basicExpressions: ['FieldQuery', 'Field'],
    grammars: {
      FieldQuery: '[Field][Spaces?][FieldOperator][Spaces?][FieldValue]',
      Field: '@[FieldName]',
      FieldName: /[a-zA-Z][a-zA-Z0-9\.\_]*/,
      FieldOperator: /==|=|<>/,
      FieldValue: ['FieldValueList', 'FieldValueString'],
      FieldValueString: ['DoubleQuoted', 'Word'],
      FieldValueList: '([FieldValueStringList*][FieldValueString])',
      FieldValueStringList: '[FieldValueString][FieldValueSeparator]',
      FieldValueSeparator: / *, */,
    },
    include: [Basic]
  }
}