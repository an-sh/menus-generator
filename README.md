
# Menus Generator

Menus Generator was initially a part of `forms-generator` and shares
many of its concepts.


### Items definitions

- items = item | items
- item(`array`) =  id , url , [ attributes , items ]
- id = `/^~?[a-zA-Z_][a-zA-Z0-9_]*$/`
- url = `string`
- attributes = `object`



# API

---


### Menu(id, options, attributes, ...items)

_Constructor_

__Throws:__

- `Error` with a `string` description on malformed items definitions.

__Arguments:__

- `id` - `string` matching `/^~?[a-zA-Z_][a-zA-Z0-9_]*$/` regular
expression, or result of `nTP` function.
- `options` - `object` with menu options or `null`. ___Fields:___
  - `noPrefix` - `boolean` option to turn off prefixes for translation
ids, `false` by default.
- `attributes` - `object` for ul tag attributes or `null`.
- `...items` - Rest arguments are interpreted as items definitions.

---

### Menu.getContent(i18n)

_Method_ ___[caches results]___

Expands menu for `i18n` locale and caches results.

__Arguments:__

- `i18n` - `i18n` translation library.

__Returns:__

- `object` for Jade menu render.

---

### Menu.render(jade, i18n, insertionsObject, ...includeJadeFiles)

_Method_

Renders HTML menu.

__Arguments:__

- `jade` - `jade` library.
- `i18n` - `i18n` translation library.
- `insertionsObject` - `object` with insertions data.
- `...includeJadeFiles` - The rest arguments are treated as jade files
  pathnames to include. All pathnames should be absolute.

__Returns:__

- `string` HTML menu.

---

### __(str)

_Function_

Wrapper for strings translation via `__` function.

__Arguments:__

- `str` - `string` to translate.

__Returns:__

`object` that will be translated with menu.

---

### __n(str, n)

_Function_

Wrapper for strings translation via `__n` function.

__Arguments:__

- `str` - `string` to translate.

__Returns:__

`object` that will be translated with menu.

---

### nTP(id)

_Function_

Forces usage of unprefixed ids for translation.

__Arguments:__

- `str` - `string` id.

__Returns:__

`object` that could be used as id in menu definitions.

---

### includeJade

_Constant_

Path to Jade mixins file. This file contains `Menu` mixin which
performs HTML rendering.

---
