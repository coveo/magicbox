/// <reference path="../MagicBox/MagicBox.ts" />
interface Completion {
  value: string;
  score: number;
  highlighted: string;
  confidence: number;
}

interface RevealQuerySuggest {
  completions: Completion[];
}

var isBasicExpression = (grammarResult: coveo.GrammarResult, magicBox: coveo.MagicBox) => {
  if(grammarResult == null){
    return true;
  }
  if (grammarResult.subResults != null) {
    return _.every(grammarResult.subResults, (grammarResult: coveo.GrammarResult) => isBasicExpression(grammarResult, magicBox));
  }
  return grammarResult.expression == null || grammarResult.expression == magicBox.grammar.expressions['word']
}

var RevealQuerySuggestAddon = (magicBox: coveo.MagicBox, access_token: string) => {
  magicBox.addAutocomplete((magicBox) => {
    if (magicBox.getText().length > 0 && isBasicExpression(magicBox.getGrammarResult(), magicBox)) {
      var deferred = $.Deferred<coveo.MagicSuggestion[]>();
      $.get('https://cloudplatform.coveo.com/rest/search/reveal/querySuggest', {
        query: magicBox.getText(),
        access_token: access_token
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
    }
  })
}