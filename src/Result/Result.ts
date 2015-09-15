/// <reference path="../Grammar.ts" />
module Coveo.MagicBox {
  export class Result {
    parent: Result;
    success: ResultSuccess;
    fail: ResultFail;

    constructor(public expression: Expression, public input: string) {
      this.success = this instanceof ResultSuccess && <ResultSuccess>this;
      this.fail = this instanceof ResultFail && <ResultFail>this;
    }

    public hash() {
      return this.input + this.expression.id;
    }

    public path(until?:Result): Result[] {
      var path = this.parent != null && this.parent != until ? this.parent.path(until) : [];
      path.push(this);
      return path;
    }

    public getParent(id: string) {
      var parent = this.parent;
      while (parent != null && parent.expression.id != id) {
        parent = parent.parent;
      }
      return parent;
    }

    public toHtmlElement(): HTMLElement {
      var element = document.createElement('span');
      var id = this.expression != null ? this.expression.id : null;

      if (id != null) {
        var attId = document.createAttribute("data-id");
        attId.value = id;
        element.setAttributeNode(attId);
      }

      element['result'] = this;
      return element;
    }
  }
}