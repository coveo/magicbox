module Coveo.MagicBox {
  export class GrammarExpressionRegExp implements GrammarExpression {
    constructor(public value: RegExp, public id: string, grammar: Grammar) {
    }

    parse(value: string):GrammarResult {
      var groups = value.match(this.value);
      if (groups != null && groups.index != 0) {
        groups = null;
      }
      if(groups == null){
        return new GrammarResultFail(true, this, value);
      }
      return new GrammarResultSuccess(groups[0], this, value);
    }
  }
}