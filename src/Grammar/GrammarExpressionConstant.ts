module Coveo.MagicBox {
  export class GrammarExpressionConstant implements GrammarExpression {
    constructor(public value: string, public id: string) {
    }

    public parse(value: string):GrammarResult {
      if (value.indexOf(this.value) == 0) {
        return new GrammarResultSuccess(this.value, this, value);
      } else {
        return new GrammarResultFail(true, this, value);
      }
    }
  }
}