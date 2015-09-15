/// <reference path="../Grammar.ts" />
module Coveo.MagicBox {
  export class ExpressionConstant implements Expression {
    constructor(public value: string, public id: string) {
    }

    public parse(input: string, end: boolean): Result {
      if (input.indexOf(this.value) != 0) {
        return new ResultFail(null, this, input);
      }
      if (end && input.length > this.value.length) {
        return new ResultFailEndOfInput(null, this, input.substr(this.value.length));
      }
      return new ResultSuccess(this.value, this, input);
    }

    public toString(){
      return this.value;
    }
  }
}