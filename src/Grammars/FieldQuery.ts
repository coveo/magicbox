/// <reference path="../../bin/js/MagicBox/MagicBox.d.ts" />
module coveo.grammars {
  export function FieldQuery() {
    return new Grammar('[expression+spaces]', {
      expression: ['[fieldQuery]', '[field]', '[notspaces]'],
      fieldQuery: '[field][space*][fieldOperator][space*][fieldValue]',
      field: '@[fieldName]',
      fieldName: /[a-zA-Z][a-zA-Z0-9\.]*/,
      fieldOperator: ['==','=','<>'],
      fieldValue: ['[fieldValueList]', '[fieldValueString]'],
      fieldValueString: ['"[notDoubleQuote]"', '[word]'],
      fieldValueList: '([fieldValueString*fieldValueSeparator])',
      fieldValueSeparator: / *, */,
      notDoubleQuote: /[^"]*/,
      spaces: / +/,
      space: ' ',
      notspaces: /[^ ]+/,
      word: /\w+/
    });
  }
}