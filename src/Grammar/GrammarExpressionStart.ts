module Coveo.MagicBox {
  export class GrammarExpressionStart extends GrammarExpressionRef {
    constructor(public ref: string, grammar: Grammar) {
      super(ref, null, null, 'start', grammar);
    }

    parse(value: string): GrammarResult {
      var ref = this.grammar.getExpression(this.ref);
      if (ref == null) {
        throw 'GrammarExpression not found:' + this.ref
      }
      return ref.parse(value);
    }
  }
}