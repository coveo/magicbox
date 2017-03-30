module Coveo.MagicBox.Utils {
  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  var escapeText = (classname: string, text: string) => {
    return `<span class="${classname}">${_.escape(text) }</span>`
  }

  export function highlightText(text: string, highligth: string, ignoreCase = false, matchClass: string = 'magic-box-hightlight', doNotMatchClass: string = '') {
    if (highligth.length == 0) {
      return text;
    }
    var escaped = escapeRegExp(highligth);
    var stringRegex = '(' + escaped + ')|(.*?(?=' + escaped + ')|.+)'
    var regex = new RegExp(stringRegex, ignoreCase ? 'gi' : 'g');
    return text.replace(regex, (text, match, notmatch) => escapeText(match != null ? matchClass : doNotMatchClass, text));
  }

  /**
   * This is essentially an helper class for dom manipulation.<br/>
   * This is intended to provide some basic functionality normally offered by jQuery.<br/>
   * To minimize the multiple jQuery conflict we have while integrating in various system, we implemented the very small subset that the framework need.<br/>
   * See {@link $$}, which is a function that wraps this class constructor, for less verbose code.
   */
  export class Dom {
    private static CLASS_NAME_REGEX = /-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g;
    private static ONLY_WHITE_SPACE_REGEX = /^\s*$/;

    /**
     * Create a new Dom object with the given HTMLElement
     * @param el The HTMLElement to wrap in a Dom object
     */
    constructor(public el: HTMLElement) {
    }

    private static handlers: {eventHandle: Function, fn: EventListener}[] = [];

    /**
     * Get or set the text content of the HTMLElement.<br/>
     * @param txt Optional. If given, this will set the text content of the element. If not, will return the text content.
     * @returns {string}
     */
    public text(txt?: string) {
      if (txt) {
        if (this.el.innerText != undefined) {
          this.el.innerText = txt;
        } else if (this.el.textContent != undefined) {
          this.el.textContent = txt;
        }
      } else {
        return this.el.innerText || this.el.textContent;
      }
    }

    /**
     * Performant way to transform a NodeList to an array of HTMLElement, for manipulation<br/>
     * http://jsperf.com/nodelist-to-array/72
     * @param nodeList a {NodeList} to convert to an array
     * @returns {HTMLElement[]}
     */
    public nodeListToArray(nodeList: NodeList): HTMLElement[] {
      var i = nodeList.length;
      var arr: HTMLElement[] = new Array(i);
      while (i--) {
        arr[i] = <HTMLElement>nodeList.item(i);
      }
      return arr;
    }

    /**
     * Empty (remove all child) from the element;
     */
    public empty() {
      while (this.el.firstChild) {
        this.el.removeChild(this.el.firstChild);
      }
    }

    /**
     * Show the element;
     */
    public show() {
      this.el.style.display = 'visible';
    }

    /**
     * Hide the element;
     */
    public hide() {
      this.el.style.display = 'none';
    }

    /**
     * Toggle the element visibility.<br/>
     * Optional visible parameter, if specified will set the element visibility
     * @param visible Optional parameter to display or hide the element
     */
    public toggle(visible?: boolean) {
      if (visible === undefined) {
        if (this.el.style.display == 'visible') {
          this.hide();
        } else {
          this.show();
        }
      } else {
        if (visible) {
          this.show();
        } else {
          this.hide();
        }
      }
    }

    /**
     * Find a child element, given a CSS selector<br/>
     * @param selector A CSS selector, can be a .className or #id
     * @returns {HTMLElement}
     */
    public find(selector: string) {
      return <HTMLElement>this.el.querySelector(selector);
    }

    /**
     * Check if the element match the selector.<br/>
     * The selector can be a class, an id or a tag.<br/>
     * Eg : .is('.foo') or .is('#foo') or .is('div').
     */
    public is(selector: string) {
      if (this.el.tagName.toLowerCase() == selector.toLowerCase()) {
        return true;
      }
      if (selector[0] == '.') {
        if (this.hasClass(selector.substr(1))) {
          return true;
        }
      }

      if (selector[0] == '#') {
        if (this.el.getAttribute('id') == selector.substr(1)) {
          return true;
        }
      }

      return false;
    }

    /**
     * Get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.<br/>
     * Stops at the body of the document
     * @param selector A CSS selector, a classname
     */
    public closest(selector: string) {
      var current = this.el, found = false;
      while (!found) {
        if ($$(current).hasClass(selector)) {
          found = true;
        }
        if (current.tagName.toLowerCase() == 'body') {
          break;
        }
        if (current.parentElement == null) {
          break;
        }
        if (!found) {
          current = current.parentElement;
        }
      }
      if (found) {
        return current;
      }
      return undefined;
    }

    /**
     * Get the first element that matches the classname by testing the element itself and traversing up through its ancestors in the DOM tree.
     *
     * Stops at the body of the document
     * @returns {any}
     */
    public parent(className: string): HTMLElement {
      if (this.el.parentElement == undefined) {
        return undefined;
      }
      return this.traverseAncestorForClass(this.el.parentElement, className);
    }

    /**
     *  Get all the ancestors of the current element that match the given className
     *
     *  Return an empty array if none found.
     * @param className
     * @returns {HTMLElement[]}
     */
    public parents(className: string): HTMLElement[] {
      let parentsFound = [];
      let parentFound = this.parent(className);
      while (parentFound) {
        parentsFound.push(parentFound);
        parentFound = new Dom(parentFound).parent(className);
      }
      return parentsFound;
    }

    /**
     * Find all child that match the given CSS selector<br/>
     * @param selector A CSS selector, can be a .className
     * @returns {HTMLElement[]}
     */
    public findAll(selector: string) {
      return this.nodeListToArray(this.el.querySelectorAll(selector));
    }

    /**
     * Find the child elements using a className
     * @param className Class of the childs elements to find
     * @returns {HTMLElement[]}
     */
    public findClass(className: string) {
      if ('getElementsByClassName' in this.el) {
        return this.nodeListToArray(this.el.getElementsByClassName(className))
      }
      // For ie 8
      return this.nodeListToArray(this.el.querySelectorAll('.' + className));
    }

    /**
     * Find an element using an ID
     * @param id ID of the element to find
     * @returns {HTMLElement}
     */
    public findId(id: string) {
      return document.getElementById(id);
    }

    /**
     * Add a class to the element. Takes care of not adding the same class if the element already has it.
     * @param className Classname to add to the element
     */
    public addClass(className: string) {
      if (!this.hasClass(className)) {
        if (this.el.className) {
          this.el.className += ' ' + className;
        } else {
          this.el.className = className;
        }
      }
    }

    /**
     * Remove the class on the element. Works even if the element does not possess the class.
     * @param className Classname to remove on the the element
     */
    public removeClass(className: string) {
      this.el.className = this.el.className.replace(new RegExp(`(^|\\s)${className}(\\s|\\b)`, 'g'), '$1');
    }

    public toggleClass(className: string, toggle: boolean) {
      if (toggle) {
        this.addClass(className);
      } else {
        this.removeClass(className);
      }
    }

    /**
     * Return an array with all the classname on the element. Empty array if the element has not classname
     * @returns {any|Array}
     */
    public getClass(): string[] {
      return this.el.className.match(Dom.CLASS_NAME_REGEX) || []
    }

    /**
     * Check if the element has the given class name
     * @param className Classname to verify
     * @returns {boolean}
     */
    public hasClass(className: string) {
      return _.contains(this.getClass(), className);
    }

    /**
     * Detach the element from the DOM.
     */
    public detach() {
      this.el.parentElement && this.el.parentElement.removeChild(this.el);
    }

    /**
     * Bind an event handler on the element. Accepts either one (a string) or multiple (Array<String>) event type.<br/>
     * @param types The {string} or {Array<String>} of types on which to bind an event handler
     * @param eventHandle The function to execute when the event is triggered
     */
    public on(types: string[], eventHandle: (evt: Event, data: any) => void);
    public on(type: string, eventHandle: (evt: Event, data: any) => void);
    public on(type: any, eventHandle: (evt: Event, data: any) => void) {
      if (_.isArray(type)) {
        _.each(type, (t: string) => {
          this.on(t, eventHandle);
        })
      } else {
        var jq = this.getJQuery();
        if (jq) {
          jq(this.el).on(type, eventHandle);
        } else if (this.el.addEventListener) {
          var fn = (e: CustomEvent)=> {
            eventHandle(e, e.detail)
          }
          Dom.handlers.push({
            eventHandle: eventHandle,
            fn: fn
          })
          this.el.addEventListener(type, fn, false);
        } else if (this.el['on']) {
          this.el['on']("on" + type, eventHandle);
        }
      }
    }

    /**
     * Bind an event handler on the element. Accepts either one (a string) or multiple (Array<String>) event type.<br/>
     * The event handler will execute only ONE time.
     * @param types The {string} or {Array<String>} of types on which to bind an event handler
     * @param eventHandle The function to execute when the event is triggered
     */
    public one(types: string[], eventHandle: (evt: Event) => void);
    public one(type: string, eventHandle: (evt: Event) => void);
    public one(type: any, eventHandle: (evt: Event) => void) {
      if (_.isArray(type)) {
        _.each(type, (t: string) => {
          this.one(t, eventHandle);
        })
      } else {
        var once = (e: Event)=> {
          this.off(type, once);
          return eventHandle(e);
        }
        this.on(type, once);
      }
    }

    /**
     * Remove an event handler on the element. Accepts either one (a string) or multiple (Array<String>) event type.<br/>
     * @param types The {string} or {Array<String>} of types on which to remove an event handler
     * @param eventHandle The function to remove on the element
     */
    public off(types: string[], eventHandle: (evt: Event, arg?: any) => void);
    public off(type: string, eventHandle: (evt: Event, arg?: any) => void);
    public off(type: any, eventHandle: (evt: Event, arg?: any) => void) {
      if (_.isArray(type)) {
        _.each(type, (t: string) => {
          this.off(t, eventHandle);
        })
      } else {
        var jq = this.getJQuery();
        if (jq) {
          jq(this.el).off(type, eventHandle);
        } else if (this.el.removeEventListener) {
          var idx = 0
          var found = _.find(Dom.handlers, (handlerObj: {eventHandle: Function, fn : EventListener}, i)=> {
            if (handlerObj.eventHandle == eventHandle) {
              idx = i;
              return true;
            }
          })
          if (found) {
            this.el.removeEventListener(type, found.fn, false);
            Dom.handlers.splice(idx, 1);
          }
        } else if (this.el['off']) {
          this.el['off']("on" + type, eventHandle);
        }
      }
    }

    /**
     * Trigger an event on the element.
     * @param type The event type to trigger
     * @param data
     */
    public trigger(type: string, data?: { [key: string]: any }) {
      var jq = this.getJQuery();
      if (jq) {
        jq(this.el).trigger(type, data)
      } else if (CustomEvent !== undefined) {
        var event = new CustomEvent(type, {detail: data, bubbles: true});
        this.el.dispatchEvent(event);
      } else {
        // TODO Support for older browser ?
      }
    }

    /**
     * Check if the element is "empty" (has no innerHTML content). Whitespace is considered empty</br>
     * @returns {boolean}
     */
    public isEmpty() {
      return Dom.ONLY_WHITE_SPACE_REGEX.test(this.el.innerHTML);
    }

    /**
     * Check if the element is a descendant of parent
     * @param other
     */
    public isDescendant(parent: HTMLElement) {
      var node = this.el.parentNode;
      while (node != null) {
        if (node == parent) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    }

    private traverseAncestorForClass(current = this.el, className: string): HTMLElement {
      if (className.indexOf('.') == 0) {
        className = className.substr(1);
      }
      var found = false;
      while (!found) {
        if ($$(current).hasClass(className)) {
          found = true;
        }
        if (current.tagName.toLowerCase() == 'body') {
          break;
        }
        if (current.parentElement == null) {
          break;
        }
        if (!found) {
          current = current.parentElement;
        }
      }
      if (found) {
        return current;
      }
      return undefined;
    }

    private getJQuery() {
      if (window['jQuery'] != undefined) {
        return window['jQuery']
      }
      return false;
    }
  }

}

module Coveo.MagicBox {
  /**
   * Convenience wrapper for the {@link Dom} class. Used to do $$(element)
   * @param el HTMLElement to wrap
   */
  export var $$ = (el: HTMLElement) => {
    if (window['Coveo'] && window['Coveo']['$$']) {
      return window['Coveo']['$$'](el);
    } else {
      return new Utils.Dom(el);
    }
  }
}
