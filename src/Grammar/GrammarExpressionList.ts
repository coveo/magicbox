module Coveo.MagicBox {
  export class GrammarExpressionList implements GrammarExpression {
    constructor(private parts: GrammarExpression[], public id: string, private grammar: Grammar) {
      if (parts.length == 0) {
        throw JSON.stringify(id) + ' should have at least 1 parts';
      }
    }

    parse(value: string): GrammarResult {
      var subResults: GrammarResultSuccess[] = [];
      var currentValue = value;
      for (var i = 0; i < this.parts.length; i++) {
        var part = this.parts[i];
        var subResult = part.parse(currentValue);
        if (subResult.success) {
          subResults.push(subResult.success);
          currentValue = currentValue.substr(subResult.success.getLength());
        } else {
          break;
        }
      }

      if (subResult.success) {
        return new GrammarResultSuccess(<GrammarResultSuccess[]>subResults, this, value);
      }

      return new GrammarResultFail(subResult.fail.getExpect(), this, value);
    }
  }
}