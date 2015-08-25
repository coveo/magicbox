module coveo {
  export class GrammarExpressionRegExp implements GrammarExpression {
    constructor(public value: RegExp, public id: string, grammar: Grammar) {
    }

    parse(value: string): GrammarResult {
      var groups = value.match(this.value);
      if (groups == null) {
        return null;
      }
      var index = value.indexOf(groups[0]);
      if (index != 0) {
        return null;
      }
      return {
        value: groups.shift(),
        groups: groups,
        expression: this
      };
    }
  }
}