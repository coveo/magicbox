/// <reference path="../bin/jasmin.d.ts" />
/// <reference path="../bin/MagicBox.d.ts" />

describe('Grammar', () => {
  it('build expression of type GrammarExpressionConstant', () => {
    var exp = Coveo.MagicBox.Grammar.buildExpression('foo', 'id', null);
    expect(exp).toEqual(jasmine.any(Coveo.MagicBox.GrammarExpressionConstant));
  });

  it('build expression of type GrammarExpressionRef', () => {
    var exp = <Coveo.MagicBox.GrammarExpressionRef>Coveo.MagicBox.Grammar.buildExpression('[foo]', 'id', null);
    expect(exp).toEqual(jasmine.any(Coveo.MagicBox.GrammarExpressionRef));
    expect(exp.ref).toBe('foo');
    expect(exp.occurrence).toBeUndefined();
    expect(exp.separator).toBeUndefined();

    exp = <Coveo.MagicBox.GrammarExpressionRef>Coveo.MagicBox.Grammar.buildExpression('[foo?]', 'id', null);
    expect(exp).toEqual(jasmine.any(Coveo.MagicBox.GrammarExpressionRef));
    expect(exp.ref).toBe('foo');
    expect(exp.occurrence).toBe('?');
    expect(exp.separator).toBeUndefined();

    exp = <Coveo.MagicBox.GrammarExpressionRef>Coveo.MagicBox.Grammar.buildExpression('[foo*bar]', 'id', null);
    expect(exp).toEqual(jasmine.any(Coveo.MagicBox.GrammarExpressionRef));
    expect(exp.ref).toBe('foo');
    expect(exp.occurrence).toBe('*');
    expect(exp.separator).toBe('bar');
  });

  it('build expression of type GrammarExpressionOptions', () => {
    var exp = <Coveo.MagicBox.GrammarExpressionOptions>Coveo.MagicBox.Grammar.buildExpression(['foo', 'bar'], 'id', null);
    expect(exp).toEqual(jasmine.any(Coveo.MagicBox.GrammarExpressionOptions));
    expect(exp.parts.length).toBe(2);
  });

  it('build expression of type GrammarExpressionList', () => {
    // this generate a list because at [ he do not know if it will be a ref start
    var exp1 = Coveo.MagicBox.Grammar.buildExpression('foo[bar', 'id', null);
    expect(exp1).toEqual(jasmine.any(Coveo.MagicBox.GrammarExpressionList));

    var exp2 = Coveo.MagicBox.Grammar.buildExpression('foo[bar]', 'id', null);
    expect(exp2).toEqual(jasmine.any(Coveo.MagicBox.GrammarExpressionList));
  });

  it('build expression of type GrammarExpressionRegExp', () => {
    var exp = Coveo.MagicBox.Grammar.buildExpression(/foo/, 'id', null);
    expect(exp).toEqual(jasmine.any(Coveo.MagicBox.GrammarExpressionRegExp));
  });
});