/// <reference path="Grammars.ts" />
module Coveo.MagicBox.Grammars {
  export var Field: SubGrammar = {
    basicExpressions: ['FieldSimpleQuery', 'FieldQuery', 'Field'],
    grammars: {
      FieldQuery: '[Field][Spaces?][FieldOperator][Spaces?][FieldValue]',
      FieldSimpleQuery: '[FieldName]:[Spaces?][FieldValue]',
      Field: '@[FieldName]',
      FieldName: /[a-zA-Z][a-zA-Z0-9\.\_]*/,
      FieldOperator: /==|=|<>/,
      FieldValue: ['FieldValueList', 'FieldValueString'],
      FieldValueString: ['DoubleQuoted', 'FieldValueNotQuoted'],
      FieldValueList: '([FieldValueString][FieldValueStringList*])',
      FieldValueStringList: '[FieldValueSeparator][FieldValueString]',
      FieldValueSeparator: / *, */,
      FieldValueNotQuoted: /[^ \(\),]+/
    },
    include: [Basic]
  }
}
