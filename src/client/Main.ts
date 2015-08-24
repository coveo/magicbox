/// <reference path="jquery.d.ts" />
/// <reference path="underscore.d.ts" />

/// <reference path="MagicBox.ts" />
/// <reference path="MagicBoxCoveo.ts" />

var coveoGrammar = new coveo.Grammar('[expression+]', {
  expression: '[fieldQuery|field]',
  fieldQuery: '[field][fieldOperator][fieldValue]',
  field: /(\@[a-z]+)/i,
  fieldOperator: /==|=|<>/,
  fieldValue: '[fieldValueNoneSpace|fieldValues]',
  fieldValueList: '([fieldValue][fieldValues*])',
  fieldValues: '(,[fieldValue])',
  fieldValueNoneSpace: /[^"]+/,
  doubleQuoteString: /"(\\"|[^"])*"/
});

var m:coveo.MagicBox
$(()=>{
  m = new coveo.MagicBox($('.magic'), coveoGrammar)
  m.addAutocomplete((magicBox)=>{
    return [{text:'test'},{text:'test2'},{text:'test3'}]
  })
})