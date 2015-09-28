/// <reference path="../Grammar.ts" />
module Coveo.MagicBox {
  export class EndOfInputResult extends Result {
    constructor(result: Result) {
      super([result], ExpressionEndOfInput, result.input);
      var endOfInput = new Result(null, ExpressionEndOfInput, result.input.substr(result.getLength()));
      endOfInput.parent = this;
      this.subResults.push(endOfInput);
    }
  }
}