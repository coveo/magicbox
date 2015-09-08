/// <reference path="Grammar.ts" />
module coveo {
  export class GrammarExpressionOptions implements GrammarExpression {
    constructor(public parts: GrammarExpression[], public id: string, private grammar: Grammar) {
    }

    parse(value: string): GrammarResultOptions {
      var subResults: GrammarResult<GrammarExpression>[] = [];
      for (var i = 0; i < this.parts.length; i++) {
        var subResult = this.parts[i].parse(value);
        if (subResult.success) {
          return new GrammarResultOptionsSucess(subResult, this, value);
        }
        subResults.push(subResult);
      }
      return new GrammarResultOptionsFail(subResults, this, value);
    }
  }

  export class GrammarResultOptions extends GrammarResult<GrammarExpressionOptions> {
    constructor(public expression: GrammarExpressionOptions, public input: string) {
      super(expression, input);
    }
  }

  export class GrammarResultOptionsSucess extends GrammarResultOptions {
    constructor(public result: GrammarResult<GrammarExpression>, public expression: GrammarExpressionOptions, public input: string) {
      super(expression, input);
      this.success = true;
    }

    getSubResults() {
      return [];
    }
  }

  export class GrammarResultOptionsFail extends GrammarResult<GrammarExpressionOptions> {
    constructor(public subResults: GrammarResult<GrammarExpression>[], public expression: GrammarExpressionOptions, public input: string) {
      super(expression, input);
    }

    getExpect() {
      return _.reduce(this.subResults, (expect, subResult: GrammarResult<GrammarExpression>) => expect.concat(subResult.getExpect()), []);
    }
  }
}