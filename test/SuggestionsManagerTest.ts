/// <reference path="../bin/jasmin.d.ts" />
/// <reference path="../bin/MagicBox.d.ts" />

describe('Suggestions manager', () => {
  let container: Coveo.MagicBox.Utils.Dom;
  let suggestionContainer: Coveo.MagicBox.Utils.Dom;
  let suggestionManager: Coveo.MagicBox.SuggestionsManager;
  let suggestion: Coveo.MagicBox.Utils.Dom;
  let elementInsideSuggestion: Coveo.MagicBox.Utils.Dom;
  let selectableClass = 'selectable';
  let selectedClass = 'selected';

  beforeEach(() => {
    buildContainer();
    suggestionManager = new Coveo.MagicBox.SuggestionsManager(suggestionContainer.el, {
        selectedClass: selectedClass,
        selectableClass: selectableClass
    });
  });

  it('adds selected class when moving on element that is selectable', () => {
    suggestionManager.handleMouseOver({
        target: suggestion.el
    });
    expect(suggestion.hasClass(selectedClass)).toBe(true);
  });

  it('adds selected class when moving on element that is inside a selectable element', () => {
    suggestionManager.handleMouseOver({
      target: elementInsideSuggestion.el
    })
    expect(suggestion.hasClass(selectedClass)).toBe(true);
  });

  it('removes selected class when moving off a selected element', () => {
    suggestion.addClass(selectedClass);

    suggestionManager.handleMouseOut({
      target: suggestion.el,
      relatedTarget: container.el
    });

    expect(suggestion.hasClass(selectedClass)).toBe(false);
  });

  it('removes selected class when moving off an element that is inside a selected element', () => {
    suggestion.addClass(selectedClass);

    suggestionManager.handleMouseOut({
      target: elementInsideSuggestion.el,
      relatedTarget: container.el
    });

    expect(suggestion.hasClass(selectedClass)).toBe(false);
  });

  it('removes selected class when moving from a selected element to off the browser window', () => {
    suggestion.addClass(selectedClass);

    suggestionManager.handleMouseOut({
      target: suggestion.el
    });

    expect(suggestion.hasClass(selectedClass)).toBe(false);
  });

  it('removes selected class when moving from an element inside a selected element to off the browser window', () => {
    suggestion.addClass(selectedClass);

    suggestionManager.handleMouseOut({
      target: elementInsideSuggestion.el
    });

    expect(suggestion.hasClass(selectedClass)).toBe(false);
  });

  it('does not remove selected class when moving element between two element inside the suggestion', () => {
    let someDeepElement = document.createElement('div');
    elementInsideSuggestion.el.appendChild(someDeepElement);
    suggestion.addClass(selectedClass);

    suggestionManager.handleMouseOut({
      target: elementInsideSuggestion.el,
      relatedTarget: someDeepElement
    })

    expect(suggestion.hasClass(selectedClass)).toBe(true);
  })

  function buildContainer() {
    container = Coveo.MagicBox.$$(document.createElement('div'));
    suggestionContainer = Coveo.MagicBox.$$(document.createElement('div'));
    suggestion = Coveo.MagicBox.$$(document.createElement('div'));
    elementInsideSuggestion = Coveo.MagicBox.$$(document.createElement('div'));

    suggestion.addClass(selectableClass);
    suggestion.el.appendChild(elementInsideSuggestion.el);
    suggestionContainer.el.appendChild(suggestion.el);
    container.el.appendChild(suggestionContainer.el);
  }
})
