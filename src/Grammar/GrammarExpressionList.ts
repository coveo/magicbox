module Coveo.MagicBox {
  export class GrammarExpressionList implements GrammarExpression {
    constructor(private parts: GrammarExpression[], public id: string) {
      if (parts.length == 0) {
        throw JSON.stringify(id) + ' should have at least 1 parts';
      }
    }

    parse(input: string, end: boolean): GrammarResult {
      var subResults: GrammarResultSuccess[] = [];
      var subInput = input;
      for (var i = 0; i < this.parts.length; i++) {
        var part = this.parts[i];
        var subResult = part.parse(subInput, end && i == this.parts.length - 1);
        if (subResult.success) {
          subResults.push(subResult.success);
          subInput = subInput.substr(subResult.success.getLength());
        } else {
          break;
        }
      }
      if (subResult.success) {
        return new GrammarResultSuccess(subResults, this, input);
      }

      return new GrammarResultFail((<GrammarResult[]>subResults).concat([subResult]), this, input);
    }

    public toString(){
      return this.id;
    }
  }
}