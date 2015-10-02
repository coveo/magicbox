/// <reference path="../Grammar.ts" />

module Coveo.MagicBox {
  export type ExpressionDef = RegExp|string|string[]|ExpressionFunctionArgument;

  export interface Expression {
    id: string;
    parse: (input: string, end: boolean) => Result;
  }
}
