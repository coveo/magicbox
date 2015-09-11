/// <reference path="../MagicBox.ts" />
module Coveo.MagicBox.Grammars {
  export function CoveoField() {
    return new Grammar('Start', {
      Start: ['Expressions','Empty'],
      Expressions: '[Expression+Spaces]',
      Expression: ['BooleanExpression', 'BasicExpression'],
      BasicExpression: ['SubExpression','FieldQuery', 'Field', 'Word'],
      SubExpression: '([Expressions])',
      BooleanExpression: '[BasicExpression][Spaces][BooleanOperator][Spaces][BasicExpression]',
      BooleanOperator: /OR|AND/,
      FieldQuery: '[Field][Spaces?][FieldOperator][Spaces?][FieldValue]',
      Field: '@[FieldName]',
      FieldName: /[a-zA-Z][a-zA-Z0-9\.]*/,
      FieldOperator: /==|=|<>/,
      FieldValue: ['FieldValueList', 'FieldValueString'],
      FieldValueString: ['DoubleQuoted', 'Word'],
      FieldValueList: '([FieldValueString+FieldValueSeparator])',
      FieldValueSeparator: / *, */,
      DoubleQuoted: '"[NotDoubleQuote]"',
      NotDoubleQuote: /[^"]*/,
      Spaces: / +/,
      Word: /[^ \(\),\."\{}\[\]<>\+\-@\/][^ \(\),\."\{}\[\]<>\+\-\/]*/,
      Empty: /(?!.)/
    });
  }
}