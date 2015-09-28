/// <reference path="../Grammar.ts" />

module Coveo.MagicBox {
  export type ExpressionDef = RegExp|string|string[]|{ (input: string, end: boolean, grammar: Grammar): Result };

  export interface Expression {
    id: string;
    parse: (input: string, end: boolean) => Result;
  }
}