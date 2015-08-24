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

interface Completion {
  value: string;
  score: number;
  highlighted: string;
  confidence: number;
}

interface RevealQuerySuggest {
  completions: Completion[];
}


var RevealQuerySuggestAddon = (magicBox: coveo.MagicBox) => {
  magicBox.addAutocomplete((magicBox) => {
    var deferred = $.Deferred<coveo.MagicSuggestion[]>();
    $.get('https://cloudplatform.coveo.com/rest/search/reveal/querySuggest', {
      query: magicBox.getText(),
      access_token: '7b9b9300-3901-437b-bafd-51ae596f1b16'
    })
      .done((result: RevealQuerySuggest) => {
        deferred.resolve(_.map(result.completions, (completion) => {
          return {
            text: completion.value
          }
        }));
      })
      .fail(() => {
        deferred.reject();
      })
    return deferred;
  })
}

var m: coveo.MagicBox
$(() => {
  m = new coveo.MagicBox($('.magic').get(0), coveoGrammar)
  RevealQuerySuggestAddon(m);
})