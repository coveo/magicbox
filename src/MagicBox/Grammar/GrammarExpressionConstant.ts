module coveo {
  export class GrammarExpressionConstant implements GrammarExpression {
    constructor(public value: string, public id: string) {
    }

    public parse(value: string): GrammarResult {
      if (value.indexOf(<string>this.value) != 0) {
        return null;
      }
      return {
        value: this.value,
        expression: this,
        HTMLElement
      };
    }
    
  }
}