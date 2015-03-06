
# Menus Generator

Menus generation designed in the same way as
[Forms Generator](https://github.com/an-sh/forms-generator)


# Description

The main interface is `Menu` class, which creates menu
definitions. These definitions could be directly rendered to HTML via
`render` method. Or `getContent` method could be used to get an object
suitable as an argument for Jade `Menu` mixin. In this case HTML will
be rendered as a part of Jade template.

___Note:___ Neither `i18n` nor `jade` are included in the production
dependencies, but rather they are expected by some methods as
arguments. `Jade` should be compatible with version `1.9.0` and `i18n`
with version `0.5.0`.

### Identifiers or IDs

Each item should have an ID that is used for several purposes. All IDs
should match `/^~?[a-zA-Z_][a-zA-Z0-9_]*$/` regular expression. `~`
prefix is stripped from actual IDs.

The first one is generating HTML ID attributes. All item IDs are
prefixed with a menu ID. So generated HTML ID attributes will look
like _`MenuID-ItemID`_. Single `-` is used as a nesting separator,
`--` is used to separate ID suffixes for additional elements like
links.

The second one is generating translation labels for fields. By default
translation IDs generation algorithm is the same as the HTML one, but
using non-prefixed IDs is allowed. `nTP` function disables prefixing
for a single ID. Prefixing ID with `~` is similar to using `nTP`
function. Also menu class constructor options allow customisation of
menu translation IDs generation. HTML ID attributes are not affected
by any of these options.

### Items definitions

- items = item-array | items
- item-array = __[__ ID , _[_ url , attributes , items _]_ __]__
- ID = `/^~?[a-zA-Z_][a-zA-Z0-9_]*$/`
- url = `string` | `null`
- attributes = `attributes-object` | `null` | attributes-array
- attributes-array =
  __[__ `attributes-object` , _[_ `attributes-object` , `attributes-object` , `attributes-object` _]_
  __]__

`attributes-object` with _`attribute : value`_ pairs is used to set
input HTML elements attributes. `attributes-array` is used to set
attributes to the following elements: `attributes-array[0]` - `<li>`
tag attributes, `attributes-array[1]` - `<a>` tag attributes,
`attributes-array[2]` - `<span>` tag attributes (text labels inside
`<a>`), `attributes-array[3]` - `<ul>` tag attributes in nested menus.

### HTML and attributes insertion

This operations doesn't alter a menu definition, separating view style
operations. As a result a menu can have several custom view renders.

It is possible to insert attributes and HTML elements into generated
menus with an object. Object key are the following selectors prefixed
by an element HTML ID:

- `::before` insertion before an element
- `::after` insertion after an element
- `::attributes` insertion of element attributes

For `::before` and `::after` selectors values can be either HTML
strings or arrays with mixin name and arguments (up to 9 mixin
arguments are supported). Or attribute objects for `::attributes`
selector. Class attributes are concatenated, preserving classes
defined in a menu constructor.

Another way to insert attributes, based on tag/type combination, is a
user supplied `attrsExtender` function. It should return an
`attributes-object` and it recieves the following arguments:

- `tag` - `string` HTML tag name.
- `level` - `int` menu nesting level, the first level is 0.
- `hasSubmenu` - `bool` true if current item has submenu.

IDs can be abbreviated with the help of `@` syntax, so selectors will
look like _`@-FieldID-EntryID::Selector`_.




# Example

Express 4 example application with pure-menu CSS style is in an
`example` directory.




# API


### Menu(ID, options, attributes, ...items)

_Constructor_

__Throws:__

- `Error` with a `string` description on malformed items definitions.

__Arguments:__

- `ID` - `string` matching `/^~?[a-zA-Z_][a-zA-Z0-9_]*$/` regular
expression, __or__ result of `nTP` function.
- `options` - `object` with menu options __or__ `null`. ___Fields:___
  - `i18nNoPrefix` - `boolean` option to turn off prefixes for
  translation IDs, `false` by default.
  - `i18nMenuID` - `string` with a menu ID, overrides a default menu
  ID in translations.
- `attributes` - `object`  `null`.
- `...items` - Rest arguments are interpreted as items definitions.


### Menu.getContent(i18n)

_Method_ ___[caches results]___

Expands menu for `i18n` locale and caches results.

__Arguments:__

- `i18n` - `i18n` translation library.

__Returns:__

- `object` for Jade menu render.


### Menu.render(jade, options, i18n, insertions, ...includeJadeFiles)

_Method_

Renders HTML menu.

__Arguments:__

- `jade` - `jade` library.
- `options` - `jade` and render options __or__ `null`. Render options:
  - `attrsExtender` - `function` that extends HTML tags attributes.
  - `prefixID` _optional_ - `string` with prefix that is added to all
  IDs __or__ `null`.
- `i18n` - `i18n` translation library.
- `insertions` _optional_ - `object` with HTML insertions __or__
  `null`.
- `...includeJadeFiles` _optional_ - The rest arguments are treated as
  jade files pathnames to include.

__Returns:__

- `string` HTML menu.


### __(str)

_Function_

Wrapper for strings translation via `__` function.

__Arguments:__

- `str` - `string` to translate.

__Returns:__

`object` that will be translated with menu.


### __n(str, n)

_Function_

Wrapper for strings translation via `__n` function.

__Arguments:__

- `str` - `string` to translate.
- `n` - `integer`.

__Returns:__

`object` that will be translated with menu.


### nTP(id)

_Function_

Forces usage of unprefixed IDs for translation.

__Arguments:__

- `id` - `string` matching `/^~?[a-zA-Z_][a-zA-Z0-9_]*$/` regular
expression.

__Returns:__

`object` that could be used as ID in menu definitions.


### includeJade

_Constant_

Path to Jade mixins file. This file contains `Menu` mixin which
performs HTML rendering.




# Jade API


### Menu(data, insertions, attrsExtender, prefixID)

_Mixin_

Renders menu.

_Arguments:_

- `data` - menu data (a result of js Menu.getContent method).
- `insertions` _optional_ - `object` with HTML insertions data __or__ `null`.
- `attrsExtender` _optional_ - `function` that extends HTML tags
  attributes. __or__ `null`.
- `prefixID` _optional_ - `string` with prefix that is added to all
  IDs __or__ `null`.
