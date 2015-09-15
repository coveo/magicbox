/// <reference path="../Grammar.ts" />
module Coveo.MagicBox {
  export class ResultFail extends Result {
    public parent: ResultFail;
    constructor(public subResults: Result[], public expression: Expression, public input: string) {
      super(expression, input);
      if (subResults != null) {
        _.each(subResults, (subResult) => {
          subResult.parent = this;
        });
      }
    }

    public path(until?: Result) {
      return <ResultFail[]>super.path(until);
    }

    toHtmlElement(): HTMLElement {
      var expect = this.getBestExpect();
      if (expect.length > 0) {
        var path = _.last(expect).path(this);
        return this.toHtmlElementPath(path);
      }
      var element = super.toHtmlElement();

      element.appendChild(document.createTextNode(this.input));
      element.className = 'magic-box-error' + (this.input.length > 0 ? '' : ' magic-box-error-empty');

      return element;
    }

    toHtmlElementPath(path: ResultFail[]): HTMLElement {
      var element = super.toHtmlElement();
      var next = path.shift();
      if (next != null) {
        var subResults = this.getPartialSuccessSubResults();
        _.each(subResults, (subResult: Result) => {
          if (subResult != next) {
            if (subResult.success) {
              element.appendChild(subResult.toHtmlElement());
            } else {
              element.appendChild(subResult.fail.partialSuccessToHtmlElement());
            }
          }
        });
        element.appendChild(next.toHtmlElementPath(path));
      } else {
        element.appendChild(document.createTextNode(this.input));
        element.className = 'magic-box-error' + (this.input.length > 0 ? '' : ' magic-box-error-empty');
      }
      return element;
    }

    partialSuccessToHtmlElement() {
      var element = super.toHtmlElement();
      var subResults = this.getPartialSuccessSubResults();
      _.each(subResults, (subResult: Result) => {
        if (subResult.success) {
          element.appendChild(subResult.toHtmlElement());
        } else {
          element.appendChild(subResult.fail.partialSuccessToHtmlElement());
        }
      });
      return element;
    }

    getPartialSuccessSubResults() {
      if (this.expression instanceof ExpressionRef || this.expression instanceof ExpressionList) {
        return _.filter(this.subResults, (subResult) => !subResult.fail || subResult.fail.hasPartialSuccess());
      }
      if (this.expression instanceof ExpressionOptions) {
        var exprect = _.last(this.getBestExpect());
        if (exprect != null) {
          var path = exprect.path(this);
          return path.length > 0 ? [_.first(path)] : null;
        }
      }
    }

    hasPartialSuccess(): boolean {
      return _.some<Result>(this.subResults, (subResult: Result) => !subResult.fail || subResult.fail.hasPartialSuccess());
    }

    getExpect(): ResultFail[] {
      if (this.subResults == null) {
        return [this];
      }
      return <ResultFail[]>_.reduce(this.subResults, (results: Result[], subResult: Result) => {
        if (subResult.success) {
          return results;
        } else {
          var expect = subResult.fail.getExpect();
          if (expect.length > 0) {
            return results.concat(expect);
          }
          return results;
        }
      }, []);
    }

    getBestExpect(): ResultFail[] {
      var expects = this.getExpect();
      var groups = _.groupBy(expects, (expect) => expect.input);
      var key = _.last(_.keys(groups).sort((a, b) => {
        return b.length - a.length;
      }));
      return _.uniq(groups[key], (expect) => expect.hash());
    }

    getHumanReadable() {
      if (this.expression instanceof ExpressionConstant) {
        return JSON.stringify((<ExpressionConstant>this.expression).value);
      }
      return this.expression.id;
    }

    getHumanReadableExpect() {
      var expects = this.getBestExpect();
      var input = expects.length > 0 ? _.last(expects).input : '';
      return 'Expected ' +
        _.map(expects, (value: ResultFail) => value.getHumanReadable()).join(' or ') +
        ' but ' +
        (input.length > 0 ? JSON.stringify(input[0]) : 'end of input') +
        ' found.';
    }
  }

  export class ResultFailEndOfInput extends ResultFail {
    constructor(subResults: Result[], public expression: Expression, input: string) {
      super(subResults, expression, input);
    }

    getExpect(): ResultFail[] {
      if (this.subResults != null) {
        return super.getExpect().concat([this]);
      }
      return super.getExpect();
    }

    getHumanReadable() {
      return 'end of input';
    }
  }
}