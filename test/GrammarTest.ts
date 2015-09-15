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
    expect(exp.separator).toBeUndefined();

    exp = <Coveo.MagicBox.ExpressionRef>Coveo.MagicBox.Grammar.buildExpression('[foo?]', 'id', null);
    expect(exp).toEqual(jasmine.any(Coveo.MagicBox.ExpressionRef));
    expect(exp.ref).toBe('foo');
    expect(exp.occurrence).toBe('?');
    expect(exp.separator).toBeUndefined();

    exp = <Coveo.MagicBox.ExpressionRef>Coveo.MagicBox.Grammar.buildExpression('[foo*bar]', 'id', null);
    expect(exp).toEqual(jasmine.any(Coveo.MagicBox.ExpressionRef));
    expect(exp.ref).toBe('foo');
    expect(exp.occurrence).toBe('*');
    expect(exp.separator).toBe('bar');
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

  it('Empty String', () => {
    var result = FakeGrammar.parse('');
    expect(result.fail).toBeTruthy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected "A" but end of input found.');
  });
  it('"A"', () => {
    var result = FakeGrammar.parse('A');
    expect(result.success).toBeTruthy();
  });
  it('"AB"', () => {
    var result = FakeGrammar.parse('AB');
    expect(result.fail).toBeTruthy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected "C" but end of input found.');
  });
  it('"ABC"', () => {
    var result = FakeGrammar.parse('ABC');
    expect(result.success).toBeTruthy();
  });
  it('"ABBC"', () => {
    var result = FakeGrammar.parse('ABBC');
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected "C" but "B" found.');
  });
});

/*

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
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected Expr but end of input found.');
  });
  it('"1"', () => {
    var result = FakeGrammar.parse('1');
    expect(result.success).toBeTruthy();

  });
  it('"1+"', () => {
    var result = FakeGrammar.parse('1+');
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected Value but end of input found.');
  });
  it('"1+2"', () => {
    var result = FakeGrammar.parse('1+2');
    expect(result.success).toBeTruthy();
  });
  it('"1+2+"', () => {
    var result = FakeGrammar.parse('1+2+');
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected end of input but "+" found.');
  });
  it('"1+2+3"', () => {
    var result = FakeGrammar.parse('1+2+3');
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected end of input but "+" found.');
  });
  it('"(1+2)+3"', () => {
    var result = FakeGrammar.parse('(1+2)+3');
    expect(result.success).toBeTruthy();
  });
});


describe('Coveo Field Grammar parse correctly', () => {
  var coveoGrammar = Coveo.MagicBox.Grammars.Expressions(Coveo.MagicBox.Grammars.Complete);
  it('Empty String', () => {
    var result = coveoGrammar.parse('');
    expect(result.success).toBeTruthy();
  });
  it('"@fieldName"', () => {
    var result = coveoGrammar.parse('@fieldName');
    expect(result.success).toBeTruthy();
  });
  it('"@fieldName"', () => {
    var result = coveoGrammar.parse('@fieldName');
    expect(result.success).toBeTruthy();
  });
  it('"@fieldName="', () => {
    var result = coveoGrammar.parse('@fieldName=');
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected FieldValue but end of input found.');
  });
  it('"@fieldName=value"', () => {
    var result = coveoGrammar.parse('@fieldName=value');
    expect(result.success).toBeTruthy();
  });
  it('"@fieldName=(value"', () => {
    var result = coveoGrammar.parse('@fieldName=(value');
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected ")" but end of input found.');
  });
  it('"@fieldName=(value)"', () => {
    var result = coveoGrammar.parse('@fieldName=(value)');
    expect(result.success).toBeTruthy();
  });
  it('"@fieldName=(value,)"', () => {
    var result = coveoGrammar.parse('@fieldName=(value,)');
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected ")" but "," found.');
  });
  it('"@fieldName=(value, abc)"', () => {
    var result = coveoGrammar.parse('@fieldName=(value, abc)');
    expect(result.success).toBeTruthy();
  });
  it('"word @fieldName=(value, abc)"', () => {
    var result = coveoGrammar.parse('word @fieldName=(value, abc)');
    expect(result.success).toBeTruthy();
  });
  it('"word @fieldName =  (value  , abc)"', () => {
    var result = coveoGrammar.parse('word @fieldName =  (value  , abc)');
    expect(result.success).toBeTruthy();
  });
  it('"word (word2"', () => {
    var result = coveoGrammar.parse('word (word2');
    console.log(result)
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected ")" but end of input found.');
  });
  it('"word(word2)"', () => {
    var result = coveoGrammar.parse('word(word2)');
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected Spaces or end of input but "(" found.');
  });
  it('"word (word2)"', () => {
    var result = coveoGrammar.parse('word (word2)');
    expect(result.success).toBeTruthy();
  });
  it('"word OR (word2)"', () => {
    var result = coveoGrammar.parse('word OR (word2)');
    expect(result.success).toBeTruthy();
  });
  it('"(word OR (word2))"', () => {
    var result = coveoGrammar.parse('(word OR (word2))');
    expect(result.success).toBeTruthy();
  });
  it('"word @"', () => {
    var result = coveoGrammar.parse('word @');
    console.log(result);
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected FieldName but end of input found.');
  });
});