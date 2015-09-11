module Coveo.MagicBox {
  export class GrammarExpressionConstant implements GrammarExpression {
    constructor(public value: string, public id: string) {
    }

    public parse(input: string, end: boolean): GrammarResult {
      if (input.indexOf(this.value) != 0) {
        return new GrammarResultFail(null, this, input);
      }
      if (end && input.length > this.value.length) {
        return new GrammarResultFailEndOfInput(null, this, input.substr(this.value.length));
      }
      return new GrammarResultSuccess(this.value, this, input);
    }

    public toString(){
      return this.value;
    }
  }
}