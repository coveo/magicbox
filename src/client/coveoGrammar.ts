/// <reference path="MagicBox.ts" />
var coveoGrammar = new coveo.Grammar('[expression+]', {
  expression: '[fieldQuery|field|word]',
  fieldQuery: '[field][fieldOperator][fieldValue?]',
  field: /\@[a-z]*/i,
  fieldOperator: /==|=|<>/,
  fieldValue: '[fieldValueList|doubleQuoteString|fieldValueNoneSpace]',
  fieldValueList: '([doubleQuoteString|fieldValueNoneSpace][fieldValues*])',
  fieldValues: ',[doubleQuoteString|fieldValueNoneSpace]',
  fieldValueNoneSpace: /[^"]+/,
  doubleQuoteString: /"((?:\\"|[^"])*)"/,
  word: /\S+/
});