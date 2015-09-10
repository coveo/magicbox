/// <reference path="../bin/jasmin.d.ts" />
/// <reference path="../bin/MagicBox.d.ts" />

// http://pegjs.org/online

/*
 A = "A" B?
 B = "B" C
 C = "C"
 */

describe('ABC Grammar', () => {
  var FakeGrammar = new Coveo.MagicBox.Grammar('A', {
    A: 'A[B?]',
    B: 'B[C+]',
    C: 'C'
  });

  it('parse ""', () => {
    var result = FakeGrammar.parse('');
    expect(result.fail).toBeTruthy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected "A" but end of input found.');
  });
  it('parse "A"', () => {
    var result = FakeGrammar.parse('A');
    expect(result.success).toBeTruthy();
  });
  it('parse "AB"', () => {
    var result = FakeGrammar.parse('AB');
    expect(result.fail).toBeTruthy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected "C" but end of input found.');
  });
  it('parse "ABC"', () => {
    var result = FakeGrammar.parse('ABC');
    expect(result.success).toBeTruthy();
  });
  it('parse "ABBC"', () => {
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

describe('Math Grammar', () => {
  var FakeGrammar = new Coveo.MagicBox.Grammar('Expr', {
    Expr: ['Product', 'Sum', 'Value'],
    Value: ['SubExpr', 'Number'],
    SubExpr: '([Expr])',
    Number: /([1-9][0-9]*|0)(.[0-9]+)?/,
    Product: '[Value]*[Value]',
    Sum: '[Value]+[Value]'
  });

  var FakeGrammar2 = new Coveo.MagicBox.Grammar('Expr', {
    Expr: '[Value+Operator]',
    Value: ['SubExpr', 'Number'],
    SubExpr: '([Expr])',
    Number: /([1-9][0-9]*|0)(.[0-9]+)?/,
    Operator: /\*|\+/
  });

  it('parse ""', () => {
    var result = FakeGrammar.parse('');
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected "(" or Number but end of input found.');
  });
  it('parse "1"', () => {
    var result = FakeGrammar.parse('1');
    expect(result.success).toBeTruthy();

  });
  it('parse "1+"', () => {
    var result = FakeGrammar.parse('1+');
    console.log(result);
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected "(" or Number but end of input found.');
  });
  it('parse "1+1"', () => {
    var result = FakeGrammar.parse('1+1');
    expect(result.success).toBeTruthy();
  });
  it('parse "1+1+"', () => {
    var result = FakeGrammar.parse('1+1+');
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected Number but "+" of input found.');
  });
  it('parse "1+1+1"', () => {
    var result = FakeGrammar.parse('1+1+1');
    expect(result.success).toBeFalsy();
    expect(result.fail.getHumanReadableExpect()).toBe('Expected Number but "+" of input found.');
  });
});