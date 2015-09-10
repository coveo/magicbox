/// <reference path="Grammar.ts" />
module Coveo.MagicBox {
  export class GrammarExpressionOptions implements GrammarExpression {
    constructor(public parts: GrammarExpressionRef[], public id: string, private grammar: Grammar) {
    }

    parse(value: string): GrammarResult {
      var subResults: GrammarResult[] = [];
      for (var i = 0; i < this.parts.length; i++) {
        var subResult = this.parts[i].parse(value);
        if (subResult.success) {
          return new GrammarResultSuccess([subResult.success], this, value);
        }
        subResults.push(subResult);
      }
      return new GrammarResultFail(_.reduce(subResults, (expect, subResult: GrammarResultFail) => expect.concat(subResult.getExpect()), []), this, value);
    }
  }
}