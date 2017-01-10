/// <reference path="MagicBox.ts"/>
module Coveo.MagicBox {

  export interface Suggestion {
    text?: string;
    index?: number;
    html?: string;
    dom?: HTMLElement;
    separator?: string;
    onSelect?: () => void;
  }

  export interface SuggestionsManagerOptions {
    selectableClass?: string;
    selectedClass?: string;
    timeout?: number;
  }

  export class SuggestionsManager {
    private pendingSuggestion: Promise<Suggestion[]>;
    private options: SuggestionsManagerOptions;
    public hasSuggestions: boolean;

    constructor(private element: HTMLElement, options?: SuggestionsManagerOptions) {
      this.options = _.defaults(options, <SuggestionsManagerOptions>{
        selectableClass: 'magic-box-suggestion',
        selectedClass: 'magic-box-selected'
      });
      // Put in a sane default, so as to not reject every suggestions if not set on initialization
      if (this.options.timeout == undefined) {
        this.options.timeout = 500;
      }

      this.hasSuggestions = false;

      this.element.onmouseover = (e) => {
        if ($$(<HTMLElement>e.target).hasClass(this.options.selectableClass)) {
          var selected = this.element.getElementsByClassName(this.options.selectedClass);
          for (var i = 0; i < selected.length; i++) {
            var elem = <HTMLElement>selected.item(i);
            $$(elem).removeClass(this.options.selectedClass);
          }
          $$(<HTMLElement>e.target).addClass(this.options.selectedClass);
        }
      };
      this.element.onmouseout = (e) => {
        if ($$(<HTMLElement>e.target).hasClass(this.options.selectableClass)) {
          $$(<HTMLElement>e.target).removeClass(this.options.selectedClass);
        }
      }
    }

    public moveDown(): Suggestion {
      var selected = <HTMLElement>this.element.getElementsByClassName(this.options.selectedClass).item(0);
      var selectables = <NodeListOf<HTMLElement>>this.element.getElementsByClassName(this.options.selectableClass);
      var index: number = -1;
      if (selected != null) {
        $$(selected).removeClass(this.options.selectedClass);
        for (var i = 0; i < selectables.length; i++) {
          if (selected == selectables.item(i)) {
            index = i;
            break;
          }
        }
        index = index == -1 ? 0 : index + 1;
      } else {
        index = 0;
      }
      selected = selectables.item(index);
      if (selected != null) $$(selected).addClass(this.options.selectedClass);

      return this.returnMoved(selected);
    }

    public moveUp(): Suggestion {
      var selected = <HTMLElement>this.element.getElementsByClassName(this.options.selectedClass).item(0);
      var selectables = <NodeListOf<HTMLElement>>this.element.getElementsByClassName(this.options.selectableClass);
      var index: number = -1;
      if (selected != null) {
        $$(selected).removeClass(this.options.selectedClass);
        for (var i = 0; i < selectables.length; i++) {
          if (selected == selectables.item(i)) {
            index = i;
            break;
          }
        }
        index = index == -1 ? selectables.length - 1 : index - 1;
      } else {
        index = selectables.length - 1;
      }
      selected = selectables.item(index);
      if (selected != null) $$(selected).addClass(this.options.selectedClass);

      return this.returnMoved(selected);
    }

    private returnMoved(selected) {
      if (selected != null) {
        
        if(selected['suggestion']) {
          return selected['suggestion'];
        }
        if(selected['no-text-suggestion']) {
          return null;
        }
        if(selected instanceof HTMLElement) {
          return {
            text : $$(selected).text()
          }
        }
      }
      return null;
    }

    public select() {
      var selected = <HTMLElement>this.element.getElementsByClassName(this.options.selectedClass).item(0);
      if (selected != null) {
        $$(selected).trigger("keyboardSelect");
      }
      return selected;
    }

    public mergeSuggestions(suggestions: Array<Promise<Suggestion[]> | Suggestion[]>, callback?: (suggestions: Suggestion[]) => void) {
      var results: Suggestion[] = [];
      var timeout;
      // clean empty / null values in the array of suggestions
      suggestions = _.compact(suggestions);
      var promise = this.pendingSuggestion = new Promise<Suggestion>((resolve, reject)=> {

        // Concat all promises results together in one flat array.
        // If one promise take too long to resolve, simply skip it
        _.each(suggestions, (sugg: Promise<Suggestion[]>)=> {
          var shouldRejectPart = false;
          setTimeout(function () {
            shouldRejectPart = true;
          }, this.options.timeout);
          sugg.then((item: Suggestion[])=> {
            if (!shouldRejectPart && item) {
              results = results.concat(item);
            }
          })
        });

        // Resolve the promise when one of those conditions is met first :
        // - All suggestions resolved
        // - Timeout is reached before all promises have processed -> resolve with what we have so far
        // - No suggestions given (length 0 or undefined)
        var onResolve = ()=> {
          if (timeout) {
            clearTimeout(timeout);
          }
          if (results.length == 0) {
            resolve([]);
          } else if (promise == this.pendingSuggestion || (this.pendingSuggestion == null)) {
            resolve(results.sort((a, b)=> b.index - a.index));
          } else {
            reject('new request queued');
          }
        };

        if (suggestions.length == 0) {
          onResolve();
        }
        if (suggestions == undefined) {
          onResolve();
        }

        timeout = setTimeout(function () {
          onResolve()
        }, this.options.timeout);

        Promise.all(suggestions)
            .then(()=> onResolve())

      });

      promise.then((suggestions: Suggestion[])=> {
        if (callback) {
          callback(suggestions);
        }
        this.updateSuggestions(suggestions);
        return suggestions;
      }).catch(()=> {
        return null;
      })
    }

    public updateSuggestions(suggestions: Suggestion[]) {
      this.element.innerHTML = '';
      this.element.className = "magic-box-suggestions";
      _.each(suggestions, (suggestion: Suggestion) => {
        var dom = suggestion.dom;
        if (!dom) {
          dom = document.createElement('div');
          dom.className = 'magic-box-suggestion';
          if (suggestion.html != null) {
            dom.innerHTML = suggestion.html;
          } else if (suggestion.text != null) {
            dom.appendChild(document.createTextNode(suggestion.text));
          } else if (suggestion.separator != null) {
            dom.className = 'magic-box-suggestion-seperator';
            var suggestionLabel = document.createElement('div');
            suggestionLabel.className = 'magic-box-suggestion-seperator-label';
            suggestionLabel.appendChild(document.createTextNode(suggestion.separator));
            dom.appendChild(suggestionLabel)
          }
          $$(dom).on('click', ()=> {
            suggestion.onSelect();
          });
          $$(dom).on('keyboardSelect', ()=> {
            suggestion.onSelect();
          });
          $$(dom).addClass(this.options.selectableClass);
        } else {
          // this need to be done if the selection is in cache and the dom is set in the suggestion
          $$(dom).removeClass(this.options.selectedClass);
          var found = $$(dom).find('.' + this.options.selectableClass);
          $$(found).removeClass(this.options.selectedClass);
        }
        dom['suggestion'] = suggestion;
        this.element.appendChild(dom);
      });
      if (suggestions.length > 0) {
        $$(this.element).addClass('magic-box-hasSuggestion');
        this.hasSuggestions = true;
      } else {
        $$(this.element).removeClass('magic-box-hasSuggestion');
        this.hasSuggestions = false;
      }
    }
  }
}
