# Magic Box
> A search box on steroid
[![Build Status](https://travis-ci.org/coveo/magicbox.svg?branch=master)](https://travis-ci.org/coveo/magicbox)

## Preview
Magic Box allows to create a search box designed to show auto completions based on a grammar

## Grammar
```
new Grammar('Start', {
    Start: ...,
    ...
})
```
## Expression
### RegExp Expression
```
/myRegex/
```
### Options Expression
```
['Option1', 'Option2', 'Option3']
```
### Ref Expression
Those can be add to the List Expression

#### Once
```
[referance]
```

#### Optionnal
```
[referance?]
```

#### Zero or many time
```
[referance*]
```

#### One or many time
```
[referance+]
```

### List Expression
```
"constant [ref]"
```

### Function Expression
IF YOU ARE NOT SURE IF YOU NEED THIS, YOU DON'T
```
(input: string, end: boolean, grammar:Grammar)=>Result
```