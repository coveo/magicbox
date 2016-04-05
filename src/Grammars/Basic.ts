/// <reference path="Grammars.ts" />
module Coveo.MagicBox.Grammars {
  export var notWordStart = ' ()[],$@\'"';
  export var notInWord = ' ()[],:';

  export var Basic: SubGrammar = {
    basicExpressions: ['Word', 'DoubleQuoted'],
    grammars: {
      DoubleQuoted: '"[NotDoubleQuote]"',
      NotDoubleQuote: /[^"]*/,
      SingleQuoted: "'[NotSingleQuote]'",
      NotSingleQuote: /[^']*/,
      Number: /[0-9]+/,
      Word: (input: string, end: boolean, expression: Expression) => {
        var regex = new RegExp('[^' + notWordStart.replace(/(.)/g, '\\$1') + '][^' + notInWord.replace(/(.)/g, '\\$1') + ']*');
        var groups = input.match(regex);
        if (groups != null && groups.index != 0) {
          groups = null;
        }
        var result = new Result(groups != null ? groups[0] : null, expression, input);
        if (result.isSuccess() && end && input.length > result.value.length) {
          return new EndOfInputResult(result);
        }
        return result;
      }
    }
  }
}
