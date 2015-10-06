/// <reference path="../Grammar.ts" />
module Coveo.MagicBox {
  export class ExpressionOptions implements Expression {
    constructor(public parts: ExpressionRef[], public id: string) {
    }

    parse(input: string, end: boolean): Result {
      var failAttempt: Result[] = [];
      for (var i = 0; i < this.parts.length; i++) {
        var subResult = this.parts[i].parse(input, end);
        if (subResult.isSuccess()) {
          return new OptionResult(subResult, this, input, failAttempt);
        }
        failAttempt.push(subResult);
      }
      return new OptionResult(null, this, input, failAttempt);
    }

    public toString() {
      return this.id;
    }
  }
}