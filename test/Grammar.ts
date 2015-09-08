/// <reference path="../bin/js/jasmin.d.ts" />
/// <reference path="../bin/js/MagicBox/MagicBox.d.ts" />
/// <reference path="../bin/js/Grammars/FieldQuery.d.ts" />

describe('Grammar', () => {
  it('build expression of type GrammarExpressionConstant', () => {
    var exp = coveo.Grammar.buildExpression('foo', 'id', null);
    expect(exp).toEqual(jasmine.any(coveo.GrammarExpressionConstant));
  });

  it('build expression of type GrammarExpressionRef', () => {
    var exp = <coveo.GrammarExpressionRef>coveo.Grammar.buildExpression('[foo]', 'id', null);
    expect(exp).toEqual(jasmine.any(coveo.GrammarExpressionRef));
    expect(exp.ref).toBe('foo');
    expect(exp.occurrence).toBeUndefined();
    expect(exp.separator).toBeUndefined();

    exp = <coveo.GrammarExpressionRef>coveo.Grammar.buildExpression('[foo?]', 'id', null);
    expect(exp).toEqual(jasmine.any(coveo.GrammarExpressionRef));
    expect(exp.ref).toBe('foo');
    expect(exp.occurrence).toBe('?');
    expect(exp.separator).toBeUndefined();

    exp = <coveo.GrammarExpressionRef>coveo.Grammar.buildExpression('[foo*bar]', 'id', null);
    expect(exp).toEqual(jasmine.any(coveo.GrammarExpressionRef));
    expect(exp.ref).toBe('foo');
    expect(exp.occurrence).toBe('*');
    expect(exp.separator).toBe('bar');
  })

  it('build expression of type GrammarExpressionOptions', () => {
    var exp = <coveo.GrammarExpressionOptions>coveo.Grammar.buildExpression(['foo', 'bar'], 'id', null);
    expect(exp).toEqual(jasmine.any(coveo.GrammarExpressionOptions));
    expect(exp.parts.length).toBe(2);
  })

  it('build expression of type GrammarExpressionList', () => {
    // this generate a list because at [ he do not know if it will be a ref start
    var exp1 = coveo.Grammar.buildExpression('foo[bar', 'id', null);
    expect(exp1).toEqual(jasmine.any(coveo.GrammarExpressionList));

    var exp2 = coveo.Grammar.buildExpression('foo[bar]', 'id', null);
    expect(exp2).toEqual(jasmine.any(coveo.GrammarExpressionList));
  })

  it('build expression of type GrammarExpressionRegExp', () => {
    var exp = coveo.Grammar.buildExpression(/foo/, 'id', null);
    expect(exp).toEqual(jasmine.any(coveo.GrammarExpressionRegExp));
  })
})

describe('Grammar FieldQuery', () => {
  console.log(coveo.grammars)
  var grammar = coveo.grammars.FieldQuery();
  it('paser field', () => {
    var response = grammar.parse('@field');
    expect(response).not.toBeNull();
  })
})

document.createElement('span')