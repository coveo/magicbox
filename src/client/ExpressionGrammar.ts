class Grammar {
  private start: GrammarExpression;
  private expressions: {[id:string]:GrammarExpression} = {};

  constructor(start: GrammarBasicExpression, expressions: {[id:string]:GrammarBasicExpression} = {}) {
    this.start = GrammarExpression.fromBasic(start);
    this.addExpressions(expressions);
  }

  public addExpressions(expressions: {[id:string]:GrammarExpression}) {
    _.forEach(expressions, (basicExpression: GrammarBasicExpression, id: string)=> {
      if (id in this.expressions) {
        throw 'Grammar already contain the id:' + id;
      }
      this.expressions[id] = GrammarExpression.fromBasic(basicExpression, id);
    });
  }

  public getExpression(id: string) {
    return this.expressions[id];
  }

  parse(value: string): GrammarResult {
    return this.start.parse(value);
  }
}

type GrammarBasicExpression = any[]|RegExp|string;

class GrammarExpression {
  constructor(public id: string, public grammar: Grammar) {

  }

  parse(value: string): GrammarResult {
    return null;
  }

  public static fromBasic(value: GrammarBasicExpression, id: string, grammar: Grammar): GrammarExpression {
    var typeOf = typeof value;
    if (typeOf == 'undefined') {
      throw 'Invalid GrammarExpression: ' + value;
    }
    if (typeOf == 'string') {
      return new GrammarExpressionString(<string>value, id, grammar);
    }
    if (typeOf == 'object') {
      if (value instanceof RegExp) {
        return new GrammarExpressionRegExp(value, id, grammar);
      } else if (value instanceof String) {
        return new GrammarExpressionString(value, id, grammar);
      } else if (value instanceof Array) {
        return new GrammarExpressionList(value, id, grammar);
      }
    }
    throw 'Invalid GrammarExpression: ' + value;
  }
}

class GrammarExpressionList extends GrammarExpression {
  private subExpressions;

  constructor(public value: GrammarBasicExpression[], public id: string, grammar: Grammar) {
    super(id, grammar);
    this.subExpressions = _.map(value, (expression)=>GrammarExpression.fromBasic(expression))
  }

  parse(value: string): GrammarResult {
    return _.reduce(this.subExpressions, (result: GrammarResult, subExpression: GrammarExpression)=> result || subExpression.parse(value), null);
  }
}

class GrammarExpressionString extends GrammarExpression {

  static spliter = /(\[\w+\])|(?:.[^\[]+)/g;
  static ref = /^\[(\w+)\]$/;

  private parts: Array<string|GrammarExpression>;

  constructor(value: string, id: string, grammar: Grammar) {
    super(id, grammar);
    this.parts = _.map(value.match(GrammarExpressionString.spliter), (part)=> {
      var match = part.match(GrammarExpressionString.ref);
      return match != null ? new RefGrammarExpression(match[1], grammar) : part;
    });
  }

  parse(value: string): GrammarResult {
    for(var i = 0; i < )
    return null;
  }
}

class GrammarExpressionRegExp extends GrammarExpression {
  constructor(public regexp: RegExp, id: string, grammar: Grammar) {
    super(id, grammar);
  }

  parse(value: string): GrammarResult {
    var groups = value.match(this.regexp);
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

class RefGrammarExpression extends GrammarExpression {
  constructor(id: string, grammar: Grammar) {
    super(id, grammar);
  }

  parse(value: string) {
    var ref = this.grammar.getExpression(this.id);
    if (ref == null) {
      throw 'GrammarExpression not found:' + this.id
    }
    return ref.parse(value);
  }
}

interface GrammarResult {
  value:string;
  groups:string[];
  expression:GrammarExpression;
  subResult?: GrammarResult[];
}