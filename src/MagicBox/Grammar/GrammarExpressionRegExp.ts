module coveo {
  export class GrammarExpressionRegExp implements GrammarExpression {
    constructor(public value: RegExp, public id: string, grammar: Grammar) {
    }

    parse(value: string) {
      var groups = value.match(this.value);
      if (groups != null && groups.index != 0) {
        groups = null;
      }
      return new GrammarResultRegExp(groups, this, value);
    }
  }

  export class GrammarResultRegExp extends GrammarResult<GrammarExpressionRegExp> {
    constructor(public groups: RegExpMatchArray, expression: GrammarExpressionRegExp, public input: string) {
      super(expression, input);
      this.success = groups != null;
    }

    getValue() {
      if (this.success) {
        return this.groups[0]
      }
      return null;
    }

    getExpect() {
      return this.success ? [] : [this];
    }
  }
}