/// <reference path="../MagicBox/MagicBox.ts" />
/// <reference path="Base.ts" />
module coveo.grammars {
  export function FieldQuery() {
    return new Grammar('{expression}', {
      expression: ['fieldQuery', 'field', 'word'],
      fieldQuery: '[field][fieldOperator][fieldValue]',
      field: /\@[a-z]*/i,
      fieldOperator: /==|=|<>/,
      fieldValue: ['fieldValueList', 'doubleQuoteString', 'fieldValueNoneSpace'],
      fieldValueList: '([fieldValue*fieldValueSeparator])',
      fieldValueSeparator: ',',
      fieldValueNoneSpace: /\S+/,
      doubleQuoteString: /"((?:\\"|[^"])*)"/,
      word: /\S+/
    }, Base());
  }
}