module coveo {
  export class GrammarExpressionConstant implements GrammarExpression {
    constructor(public value: string, public id: string) {
    }

    public parse(value: string) {
      return new GrammarResultConstant(value.indexOf(this.value) == 0, this, value);
    }
  }

  export class GrammarResultConstant extends GrammarResult<GrammarExpressionConstant> {
    constructor(public success: boolean, expression: GrammarExpressionConstant, public input:string) {
      super(expression, input);
    }

    getValue() {
      return this.success ? this.expression.value : null;
    }

    getExpect(){
      return this.success ? [] : [this];
    }
  }
}