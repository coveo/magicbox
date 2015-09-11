/// <reference path="Grammar.ts" />
module Coveo.MagicBox {
  export class GrammarExpressionOptions implements GrammarExpression {
    constructor(public parts: GrammarExpressionRef[], public id: string) {
    }

    parse(input: string, end: boolean): GrammarResult {
      var subResults: GrammarResult[] = [];
      for (var i = 0; i < this.parts.length; i++) {
        var subResult = this.parts[i].parse(input, end);
        if (subResult.success) {
          return new GrammarResultSuccess([subResult.success], this, input);
        }
        subResults.push(subResult);
      }
      var expected = _.reduce(subResults, (expect: GrammarResultFail[], subResult: GrammarResultFail) => expect.concat(subResult.getExpect()), []);
      if (_.all(expected, (subResult)=>subResult.input == input)) {
        return new GrammarResultFail(null, this, input);
      } else {
        return new GrammarResultFail(subResults, this, input);
      }
    }

    public toString() {
      return this.id;
    }
  }
}