/// <reference path="../bin/jasmin.d.ts" />
/// <reference path="../bin/MagicBox.d.ts" />

describe('Grammar Expression Builder build expression of type', () => {
  it('ExpressionConstant', () => {
    var exp = Coveo.MagicBox.Grammar.buildExpression('foo', 'id', null);
    expect(exp).toEqual(jasmine.any(Coveo.MagicBox.ExpressionConstant));
  });

  it('ExpressionRef', () => {
    var exp = <Coveo.MagicBox.ExpressionRef>Coveo.MagicBox.Grammar.buildExpression('[foo]', 'id', null);
    expect(exp).toEqual(jasmine.any(Coveo.MagicBox.ExpressionRef));
    expect(exp.ref).toBe('foo');
    expect(exp.occurrence).toBeUndefined();

    exp = <Coveo.MagicBox.ExpressionRef>Coveo.MagicBox.Grammar.buildExpression('[foo?]', 'id', null);
    expect(exp).toEqual(jasmine.any(Coveo.MagicBox.ExpressionRef));
    expect(exp.ref).toBe('foo');
    expect(exp.occurrence).toBe('?');

    exp = <Coveo.MagicBox.ExpressionRef>Coveo.MagicBox.Grammar.buildExpression('[foo{2}]', 'id', null);
    expect(exp).toEqual(jasmine.any(Coveo.MagicBox.ExpressionRef));
    expect(exp.ref).toBe('foo');
    expect(exp.occurrence).toBe(2);
  });

  it('ExpressionOptions', () => {
    var exp = <Coveo.MagicBox.ExpressionOptions>Coveo.MagicBox.Grammar.buildExpression(['foo', 'bar'], 'id', null);
    expect(exp).toEqual(jasmine.any(Coveo.MagicBox.ExpressionOptions));
    expect(exp.parts.length).toBe(2);
  });

  it('ExpressionList', () => {
    // this generate a list because at [ he do not know if it will be a ref start
    var exp1 = Coveo.MagicBox.Grammar.buildExpression('foo[bar', 'id', null);
    expect(exp1).toEqual(jasmine.any(Coveo.MagicBox.ExpressionList));

    var exp2 = Coveo.MagicBox.Grammar.buildExpression('foo[bar]', 'id', null);
    expect(exp2).toEqual(jasmine.any(Coveo.MagicBox.ExpressionList));
  });

  it('ExpressionRegExp', () => {
    var exp = Coveo.MagicBox.Grammar.buildExpression(/foo/, 'id', null);
    expect(exp).toEqual(jasmine.any(Coveo.MagicBox.ExpressionRegExp));
  });
});
// http://pegjs.org/online

/*
 A = "A" B?
 B = "B" C
 C = "C"
 */

describe('ABC Grammar parse correctly', () => {
  var FakeGrammar = new Coveo.MagicBox.Grammar('A', {
    A: 'A[B?]',
    B: 'B[C+]',
    C: 'C'
  });

  var FakeGrammar2 = new Coveo.MagicBox.Grammar('A', {
    A: '[B][C*]',
    B: 'B',
    C: 'C[B]'
  });

  it('Empty String', () => {
    var result = FakeGrammar.parse('');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected "A" but end of input found.');
  });
  it('"A"', () => {
    var result = FakeGrammar.parse('A');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"AB"', () => {
    var result = FakeGrammar.parse('AB');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected "C" but end of input found.');
  });
  it('"ABC"', () => {
    var result = FakeGrammar.parse('ABC');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"AC"', () => {
    var result = FakeGrammar.parse('AC');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected "B" but "C" found.');
  });
  it('"ABBC"', () => {
    var result = FakeGrammar.parse('ABBC');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected "C" but "B" found.');
  });

  it('"BC"', () => {
    var result = FakeGrammar2.parse('BC');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected "B" but end of input found.');
  });

  it('"BCBB"', () => {
    var result = FakeGrammar2.parse('BCBB');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected end of input or "C" but "B" found.');
  });
});

/*
bcbb

 Expr = Product / Sum / Value
 Value = SubExpr / Number
 SubExpr = "(" Expr ")"
 Number = [0-9]+
 Product = Value "*" Value
 Sum= Value "+" Value

 */

describe('Math Grammar parse correctly', () => {
  var FakeGrammar = new Coveo.MagicBox.Grammar('Expr', {
    Expr: ['Product', 'Sum', 'Value'],
    Value: ['SubExpr', 'Number'],
    SubExpr: '([Expr])',
    Number: /([1-9][0-9]*|0)(\.[0-9]+)?/,
    Product: '[Value]*[Value]',
    Sum: '[Value]+[Value]'
  });

  it('Empty String', () => {
    var result = FakeGrammar.parse('');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected Expr but end of input found.');
  });
  it('"1"', () => {
    var result = FakeGrammar.parse('1');
    expect(result.isSuccess()).toBeTruthy();

  });
  it('"1+"', () => {
    var result = FakeGrammar.parse('1+');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected Value but end of input found.');
  });
  it('"1+2"', () => {
    var result = FakeGrammar.parse('1+2');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"1+2+"', () => {
    var result = FakeGrammar.parse('1+2+');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected end of input but "+" found.');
  });
  it('"1+2+3"', () => {
    var result = FakeGrammar.parse('1+2+3');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected end of input but "+" found.');
  });
  it('"(1+2)+3"', () => {
    var result = FakeGrammar.parse('(1+2)+3');
    expect(result.isSuccess()).toBeTruthy();
  });
});


describe('Coveo Field Grammar parse correctly', () => {
  var completeExpressions = Coveo.MagicBox.Grammars.Expressions(Coveo.MagicBox.Grammars.Complete);
  var coveoGrammar = new Coveo.MagicBox.Grammar(completeExpressions.start, completeExpressions.expressions);

  it('Empty String', () => {
    var result = coveoGrammar.parse('');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"@fieldName"', () => {
    var result = coveoGrammar.parse('@fieldName');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"@fieldName"', () => {
    var result = coveoGrammar.parse('@fieldName');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"@fieldName="', () => {
    var result = coveoGrammar.parse('@fieldName=');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected FieldValue but end of input found.');
    console.log(result.clean());
  });
  it('"@fieldName=value"', () => {
    var result = coveoGrammar.parse('@fieldName=value');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"@fieldName=(value"', () => {
    var result = coveoGrammar.parse('@fieldName=(value');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected FieldValueSeparator or ")" but end of input found.');
  });
  it('"@fieldName=(value)"', () => {
    var result = coveoGrammar.parse('@fieldName=(value)');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"@fieldName=(value,)"', () => {
    var result = coveoGrammar.parse('@fieldName=(value,)');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected FieldValueString but ")" found.');
  });
  it('"@fieldName=(value, abc)"', () => {
    var result = coveoGrammar.parse('@fieldName=(value, abc)');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"word @fieldName=(value, abc)"', () => {
    var result = coveoGrammar.parse('word @fieldName=(value, abc)');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"word @fieldName =  (value  , abc)"', () => {
    var result = coveoGrammar.parse('word @fieldName =  (value  , abc)');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"word (word2"', () => {
    var result = coveoGrammar.parse('word (word2');
    console.log(result)
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected ":" or Spaces or ")" but end of input found.');
  });
  it('"word(word2)"', () => {
    var result = coveoGrammar.parse('word(word2)');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected ":" or end of input or Spaces but "(" found.');
  });
  it('"word (word2)"', () => {
    var result = coveoGrammar.parse('word (word2)');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"word OR (word2)"', () => {
    var result = coveoGrammar.parse('word OR (word2)');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"word OR"', () => {
    var result = coveoGrammar.parse('word OR');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"(word OR (word2))"', () => {
    var result = coveoGrammar.parse('(word OR (word2))');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"word @"', () => {
    var result = coveoGrammar.parse('word @');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected FieldName but end of input found.');
  });
  it('"@field "', () => {
    var result = coveoGrammar.parse('@field ');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected FieldOperator or Expression but end of input found.');
  });
  it('" @field"', () => {
    var result = coveoGrammar.parse(' @field');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected Start but " " found.');
  });
  it('"foo ( bar foo )"', () => {
    var result = coveoGrammar.parse('foo ( bar foo )');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"foo bar foo "', () => {
    var result = coveoGrammar.parse('foo bar foo ');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected Expression but end of input found.');
  });
  it('"foo bar "', () => {
    var result = coveoGrammar.parse('foo bar ');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected Expression but end of input found.');
  });
  it('"$extension("', () => {
    var result = coveoGrammar.parse('$extension(');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected QueryExtensionArgumentName but end of input found.');
  });
  it('"$extension(a"', () => {
    var result = coveoGrammar.parse('$extension(a');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected ":" but end of input found.');
  });
  it('"$extension(a:"', () => {
    var result = coveoGrammar.parse('$extension(a:');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected QueryExtensionArgumentValue but end of input found.');
  });
  it('"$extension(a:value"', () => {
    var result = coveoGrammar.parse('$extension(a:value');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected ":" or Spaces or "," or ")" but end of input found.');
  });
  it('"$extension(a:value)"', () => {
    var result = coveoGrammar.parse('$extension(a:value)');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"$extension(a:value,"', () => {
    var result = coveoGrammar.parse('$extension(a:value,');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected QueryExtensionArgumentName but end of input found.');
  });
  it('"$extension(a:value,b"', () => {
    var result = coveoGrammar.parse('$extension(a:value,b');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected ":" but end of input found.');
  });
  it('"$extension(a:value,b:"', () => {
    var result = coveoGrammar.parse('$extension(a:value,b:');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected QueryExtensionArgumentValue but end of input found.');
  });
  it('"$extension(a:value,b:\'"', () => {
    var result = coveoGrammar.parse('$extension(a:value,b:\'');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected "\'" but end of input found.');
  });
  it('"$extension(a:value,b:\'abc\')"', () => {
    var result = coveoGrammar.parse('$extension(a:value,b:\'abc\')');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"["', () => {
    var result = coveoGrammar.parse('[');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected "[" but end of input found.');
  });
  it('"[["', () => {
    var result = coveoGrammar.parse('[[');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected "@" but end of input found.');
  });
  it('"[[@field"', () => {
    var result = coveoGrammar.parse('[[@field');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected "]" but end of input found.');
  });
  it('"[[@field]"', () => {
    var result = coveoGrammar.parse('[[@field]');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected Expression but end of input found.');
  });
  it('"[[@field]]"', () => {
    var result = coveoGrammar.parse('[[@field]]');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected Expression but "]" found.');
  });
  it('"[[@field] @sysuri"', () => {
    var result = coveoGrammar.parse('[[@field] @sysuri');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected FieldOperator or Spaces or "]" but end of input found.');
  });
  it('"[[@field] @sysuri]"', () => {
    var result = coveoGrammar.parse('[[@field] @sysuri]');
    expect(result.isSuccess()).toBeTruthy();
  });
  it('"a a a a "', () => {
    var result = coveoGrammar.parse('a a a a ');
    expect(result.isSuccess()).toBeFalsy();
    expect(result.getHumanReadableExpect()).toBe('Expected Expression but end of input found.');
  });


});