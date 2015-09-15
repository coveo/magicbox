/// <reference path="../Grammar.ts" />
module Coveo.MagicBox {
  export class ExpressionOptions implements Expression {
    constructor(public parts: ExpressionRef[], public id: string) {
    }

    parse(input: string, end: boolean): Result {
      var subResults: Result[] = [];
      for (var i = 0; i < this.parts.length; i++) {
        var subResult = this.parts[i].parse(input, end);
        if (subResult.success) {
          return new ResultSuccess([subResult.success], this, input);
        }
        subResults.push(subResult);
      }
      var expected = _.reduce(subResults, (expect: ResultFail[], subResult: ResultFail) => expect.concat(subResult.getExpect()), []);
      if (_.all(expected, (subResult)=>subResult.input == input)) {
        return new ResultFail(null, this, input);
      } else {
        return new ResultFail(subResults, this, input);
      }
    }

    public toString() {
      return this.id;
    }
  }
}