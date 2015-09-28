/// <reference path="../Grammar.ts" />
module Coveo.MagicBox {
  export class ExpressionFunction implements Expression {
    constructor(public func: (input: string, end: boolean, grammar?: Grammar) => Result, public id: string, public grammar: Grammar) {
    }

    public parse(input: string, end: boolean): Result {
      return this.func(input, end, this.grammar);
    }

    public toString() {
      return this.id;
    }
  }
}