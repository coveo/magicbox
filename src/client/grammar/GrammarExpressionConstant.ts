module coveo {
  export class GrammarExpressionConstant implements GrammarExpression {
    constructor(public value: string, public id?: string) {
      if (this.id == null) {
        this.id = value.replace(/\W+/g, '_')
      }
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