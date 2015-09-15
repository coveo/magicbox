/// <reference path="../Grammar.ts" />
module Coveo.MagicBox {
  export class ExpressionList implements Expression {
    constructor(private parts: Expression[], public id: string) {
      if (parts.length == 0) {
        throw JSON.stringify(id) + ' should have at least 1 parts';
      }
    }

    parse(input: string, end: boolean): Result {
      var subResults: ResultSuccess[] = [];
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
        return new ResultSuccess(subResults, this, input);
      }

      return new ResultFail((<Result[]>subResults).concat([subResult]), this, input);
    }

    public toString(){
      return this.id;
    }
  }
}