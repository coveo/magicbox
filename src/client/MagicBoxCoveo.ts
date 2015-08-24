/*
var values = ["Alexandre Pare", "Martin Laporte", "Guillaume Simard", "Gregory Laporte", "Roxanne Fanny Corriveau", "Paul Pianta", "Magalie Allard", "Olivier Lamothe (Developers)", "Cédric Gagnon (Developers)", "Josianne Riopel", "Laurent Simoneau", "Olivier Lamothe", "Coveo Q&A", "Francis Turgeon-Boutin", "Martin Ouellet", "apare@coveo.com"];
var key = ["from:", '@sysfrom='];

class MagicBoxCoveo extends MagicBox {

  static prefixed(canBeFirst: boolean, ...classes: string[]) {
    return (text: string, tokens: MagicToken[])=> {
      var last = _.last(tokens);
      return (canBeFirst && last == null) || (last != null && _.all(classes, (_class)=>_.contains(last.class.split(/\s+/g), _class)));
    }
  }

  static matchers: MagicMatcher[] = [
    //from
    {
      regex: /^\s*(from:)/,
      class: 'from-init',
      condition: MagicBoxCoveo.prefixed(true, 'complete-expression')
    },
    {
      regex: /^\s*(?:(?!")(\S+)|"([^"]+)")/,
      class: 'from-value complete-expression',
      condition: MagicBoxCoveo.prefixed(false, 'from-init')
    },
    {
      regex: /^\s*"([^"]*)/,
      class: 'from-value from-value-incomplete',
      condition: MagicBoxCoveo.prefixed(false, 'from-init')
    },
    //field
    {
      regex: /^\s*(@\w+)(==|=|<|>)/,
      class: 'field',
      condition: MagicBoxCoveo.prefixed(true, 'complete-expression')
    },
    {
      regex: /^\s*(?:(?!")(\S+)|"([^"]+)")/,
      class: 'from-value complete-expression',
      condition: MagicBoxCoveo.prefixed(false, 'field')
    },
    {
      regex: /^\s*"([^"]*)/,
      class: 'from-value from-value-incomplete',
      condition: MagicBoxCoveo.prefixed(false, 'field')
    },

    {
      regex: /^\s*\S+/,
      class: 'none complete-expression',
      condition: MagicBoxCoveo.prefixed(true, 'complete-expression')
    },
    {
      regex: /^\s*\S/,
      class: ''
    }
  ];

  private ghostIndex = 0;

  constructor(public element: JQuery) {
    super(element);
    _.each(MagicBoxCoveo.matchers, (matcher)=> {
      this.addMatcher(matcher);
    })
  }

  public upPress(preventDefault: Function) {
    preventDefault();
    this.ghostIndex = Math.max(0,this.ghostIndex - 1);
    this.updateGhostText();
  }

  public downPress(preventDefault: Function) {
    preventDefault();
    this.ghostIndex++;
    this.updateGhostText();
  }

  public anyPress(preventDefault: Function) {
    this.ghostIndex = 0;
  }

  public tabPress(preventDefault: Function) {
    var ghostText = this.ghostText();
    if (ghostText != null) {
      var last = _.last(this.getTokens());
      if (last != null && last.class == 'from-init' && /\s/.test(ghostText)) {
        this.setText(this.getText() + '"' + ghostText + '"');
      } else if (last != null && _.contains(last.class.split(/\s+/g), 'from-value') && /\s/.test(ghostText)) {
        var text = this.getText();
        this.setText(text.substr(0, last.start) + '"' + text.substr(last.start, last.length).replace(/^\s*"?/, '') + ghostText + '"');
      } else {
        this.setText(this.getText() + ghostText);
      }
      this.setCursor(this.getText().length);
      preventDefault();
    }
  }

  public ghostText() {
    var last: MagicToken = _.last(this.getTokens());
    var text = this.getText();
    if (last != null) {
      if (_.contains(last.class.split(/\s+/g), 'none')) {
        var returnValue = last != null ? this.ghostValues(text.substr(last.start, last.length), key) : this.ghostValues(text, key);
        if (returnValue != null) {
          return returnValue;
        }
      }
      if (last.class == 'from-init') {
        var returnValue = values[this.ghostIndex];
        if (returnValue != null) {
          return returnValue;
        }
      }
      if (_.contains(last.class.split(/\s+/g), 'from-value') && last.start + last.length == text.length) {
        var subtoken = _.find(last.subTokens, (subToken)=>subToken != null);
        var returnValue = this.ghostValues(text.substr(last.start + subtoken.start, subtoken.length), values);
        if (returnValue != null) {
          return returnValue;
        }
      }
    }
    return null;
  }

  public ghostValues(current: string, values: string[]) {
    var count = 0;
    current = current.replace(/^\s+/, '').toLowerCase();
    for (var i = 0; i < values.length; i++) {
      var value = values[i];
      var index = value.toLowerCase().indexOf(current);
      console.log(count, this.ghostIndex);
      if (index == 0 && count++ == this.ghostIndex) {
        return value.substr(current.length);
      }
    }
    return null;
  }
}
*/