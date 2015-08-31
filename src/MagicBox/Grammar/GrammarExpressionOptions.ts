/// <reference path="Grammar.ts" />
module coveo {
  export class GrammarExpressionOptions implements GrammarExpression {
    constructor(private parts: GrammarExpression[], public id: string, private grammar: Grammar) {
    }

    parse(value: string): GrammarResult {
      var subresult = _.reduce(this.parts, (result: GrammarResult, subExpression: GrammarExpression) => result || subExpression.parse(value), null);
      if (subresult != null) {
        return {
          value: subresult.value,
          expression: this,
          subResults: [subresult]
        }
      }
      return null;
    }

  }
}