
var path = require('path');
var util = require('util');

// -----------------------------------------------------------------------------
// utils
// -----------------------------------------------------------------------------

function extendProps(to, from) {
  for(var prop in from) {
    if (from.hasOwnProperty(prop)) {
      to[prop] = from[prop];
    }
  }
  return to;
}

function copyObjectProps(obj) {
  var result = {};
  extendProps(result, obj);
  return result;
}


function isString(obj) {
  return typeof obj === 'string' || ( obj instanceof String );
}

function isObject(obj) {
  return obj instanceof Object;
}

function isFunction(obj) {
  return obj instanceof Function;
}

function isArray(obj) {
  return obj instanceof Array;
}

function isArrayMember(arr, obj) {
  return (arr.indexOf(obj) !== -1);
}

function throwError() {
  var error = util.format.apply(util, arguments);
  throw new Error(error);
}

function makeJadeIncludes(includes) {
  var result = "";
  for (var i = 0; i < includes.length; i++) {
    result += 'include ' + includes[i] + '\n';
  }
  return result;
}

var IDregexp = /^~?[a-zA-Z_][a-zA-Z0-9_]*$/;


// -----------------------------------------------------------------------------
// translation
// -----------------------------------------------------------------------------


var localesToGenerate = null;
var localesGenerator = null;

function setLocalesGeneration(generator, locales) {
  if(generator && locales) {
    localesToGenerate  = locales.slice();
    localesGenerator = generator;
  } else {
    localesToGenerate = null;
    localesGenerator = null;
  }
}

function fillTranslation(fn, args) {
  if(localesToGenerate && localesGenerator) {
    var method = localesGenerator[fn];
    var nlocales = localesToGenerate.length;
    if(method && localesGenerator.setLocale && nlocales) {
      for(var i =0; i < nlocales; i++) {
        localesGenerator.setLocale(localesToGenerate[i]);
        method.apply(localesGenerator, args);
      }
      return true;
    }
  }
  return false;
}

function __() {
  var args = arguments;
  fillTranslation("__", args);
  return function(i18n) {
    return (i18n && i18n.__) ? i18n.__.apply(i18n, args) : args[0];
  };
}

function __n() {
  var args = arguments;
  fillTranslation("__n", args);
  return function(i18n) {
    return (i18n && i18n.__n) ? i18n.__n.apply(i18n, args) : args[0];
  };
}

function noTranslationPrefix(id) {
  var strObj = new String(id);
  strObj._globalId = true;
  return strObj;
}

function stripPrefix(id) {
  if(isString(id) && id[0] === '~') {
    return noTranslationPrefix(id.slice(1));
  }
  return id;
}

function transformObjectProps(obj, fn) {
  var nobj = {};
  for(var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      nobj[prop] = fn(obj[prop]);
    }
  }
  return nobj;
}

function transformArrayProps(obj, fn) {
  var nobj = [];
  for(var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      nobj[prop] = fn(obj[prop]);
    }
  }
  return nobj;
}

function expand(eObj, i18n, force) {
  var locale = (i18n && i18n.getLocale) ? i18n.getLocale() : "";

  if(eObj.expansions[locale] && !force) {
    return eObj.expansions[locale];
  }

  function expand_(obj) {
    if(isString(obj)) {
      return obj;
    }
    if(isFunction(obj)) {
      return obj(i18n);
    }
    if(isArray(obj)) {
      return transformArrayProps(obj, expand_);
    }
    if(isObject(obj)) {
      return transformObjectProps(obj, expand_);
    }
    return obj;
  }

  eObj.expansions[locale] = expand_(eObj.skel);
  return eObj.expansions[locale];
}


// -----------------------------------------------------------------------------
// menu generation
// -----------------------------------------------------------------------------

function makeMenuID(opts, menuId, elemId) {
  if(!elemId) return menuId.toString();
  return  menuId + "-" + elemId;
}

function makeMenuTransaltion(opts, menuId, elemId) {
  if(elemId._globalId || opts.i18nNoPrefix) return __( elemId.toString() );
  var actualMenuID = opts.i18nMenuID ? opts.i18nMenuID : menuId;
  return __( ( actualMenuID ? (actualMenuID + "-") : "" ) + elemId );
}

function checkMenuID(ids, opts, menuId, elemId) {
  if( !isString(elemId) || !IDregexp.test(elemId) ) {
    return true;
  }
  var id = makeMenuID(opts, menuId, elemId);
  if(id in ids) {
    throwError("Menu \"%s\", Duplicate id value.\nValue: %j", menuId, elemId);
  }
  return false;
}

function checkAttrs(attrs) {
  function checkArrayAttrs(attrs) {
    for(var i = 0; i < attrs.lenght; i++) {
      if(attrs[i] && !isObject(attrs[i])) return true;
    }
    return false;
  }
  if(!attrs || isObject(attrs) || (isArray(attrs) && !checkArrayAttrs(attrs))) {
    return false;
  }
  return true;
}

function attrsHelper(attrs, resultObj) {
  if(isArray(attrs)) {
    resultObj.attrs = attrs[0] ? copyObjectProps(attrs[0]) : {};
    resultObj.linkAttrs = attrs[1] ? copyObjectProps(attrs[1]) : {};
    resultObj.labelAttrs = attrs[2] ? copyObjectProps(attrs[2]) : {};
    resultObj.listAttrs = attrs[3] ? copyObjectProps(attrs[3]) : {};
  } else {
    resultObj.attrs = attrs ? copyObjectProps(attrs) : {};
    resultObj.linkAttrs = {};
    resultObj.labelAttrs = {};
    resultObj.listAttrs = {};
  }
  delete resultObj.attrs.id;
  delete resultObj.linkAttrs.id;
  delete resultObj.labelAttrs.id;
  delete resultObj.listAttrs.id;
}

function makeSubmenu(ids, opts, menuId, id, url, attrs, entries) {

  if(url && !isString(url)) {
    throwError("Menu \"%s\": Submenu \"%s\": Url is not a string.\nValue: %j",
               menuId, id, url);
  }

  if(checkAttrs(attrs)) {
    throwError("Menu \"%s\", Submenu \"%s\": Attributes type error.\nValue: %j",
               menuId, id, attrs);
  }

  if(!isArray(entries) || entries.length === 0) {
    throwError("Menu \"%s\", Submenu \"%s\": Entries specification is empty.\nValue: %j",
               menuId, id, entries);
  }

  var result = [];
  var idObj = stripPrefix(id);
  var idStr = idObj ? idObj.toString() : idObj;

  result.id = makeMenuID(opts, menuId, idObj);
  ids[result.id] = true;
  attrsHelper(attrs, result);
  if(idObj) {
    result.label = makeMenuTransaltion(opts, menuId, idObj);
  }
  if(url) {
    result.linkAttrs.href = url;
  }
  for(var i=0; i<entries.length; i++) {
    var entry = entries[i];
    var itemIdObj = stripPrefix(entry[0]);
    if(!isArray(entry) || entry.length < 1) {
      throwError("Menu \"%s\", Submenu \"%s\": Entry #%d specification error.\nValue: %j",
                 menuId, idStr, i, entries);
    }
    if(checkMenuID(ids, opts, menuId, itemIdObj)) {
      throwError("Menu \"%s\", Submenu \"%s\": Entry #%d id value is not allowed.\nValue: %j",
                 menuId, idStr, i, entries);
    }
    if(entry.length > 3) {
      result[i] = makeSubmenu(ids, opts, menuId, itemIdObj, entry[1], entry[2],
                              entry[3] ? entry.slice(3) : null);
    } else {
      result[i] = makeItem(ids, opts, menuId, itemIdObj, entry[1], entry[2]);
    }
  }
  return result;
}

function makeItem(ids, opts, menuId, id, url, attrs) {
  var idStr = id.toString();

  if(url && !isString(url)) {
    throwError("Menu \"%s\": Entry \"%s\": Url is not a string.\nValue: %j",
               menuId, idStr, url);
  }

  if(checkAttrs(attrs)) {
    throwError("Menu \"%s\", Entry \"%s\": Attributes type error.\nValue: %j",
               menuId, idStr, attrs);
  }

  var result = {};
  result.id = makeMenuID(opts, menuId, id);
  ids[result.id] = true;
  result.label = makeMenuTransaltion(opts, menuId, id);
  attrsHelper(attrs, result);
  if(url) {
    result.linkAttrs.href = url;
  }
  return result;
}

function Menu(id, opts, attrs) {

  if(!isString(id) || !IDregexp.test(id)) {
    throwError("Menu id is not allowed.\nValue: %j", id);
  }

  var idObj = stripPrefix(id);
  var idStr = idObj.toString();

  if(checkAttrs(attrs)) {
    throwError("Menu \"%s\": Attributes type error.\nValue: %j", idStr, attrs);
  }

  if(opts && !isObject(opts)) {
    throwError("Menu \"%s\": Options type error.\nValue: %j", idStr, opts);
  }

  var entrySpecs = Array.prototype.slice.call(arguments, 3);
  var ids = {};
  this.skel = makeSubmenu(ids, opts ? opts : {}, idObj, null, null, attrs, entrySpecs);
  this.expansions = {};
}

Menu.prototype.getContent = function(i18n) {
  var menu = this;
  return expand(menu, i18n);
};

Menu.prototype.render = function(jade, options, i18n, insertions) {
  var menu = this.getContent(i18n);
  var includeFiles = Array.prototype.slice.call(arguments, 4);
  var opts = {
    'basedir' : "/",
    '__menu' : menu,
    '__insertions' : insertions ? insertions : {},
    '__attrsExtender' : options && options.attrsExtender ? options.attrsExtender : null,
    '__pefixID' : options && options.pefixID ? options.pefixID : null,
  };
  extendProps(opts, options);
  var mixins = 'include ' + path.join(__dirname, "../jade/mixins.jade") + '\n';
  var code = makeJadeIncludes(includeFiles);
  return jade.render(mixins + code + '\n+Menu(__menu, __insertions, __attrsExtender, __pefixID)', opts);
};


// -----------------------------------------------------------------------------
// API
// -----------------------------------------------------------------------------

// functions
exports.__ = __;
exports.__n = __n;
exports.nTP = noTranslationPrefix;
exports.setLocalesGeneration = setLocalesGeneration;
// classes
exports.Menu = Menu;
// jade mixins include
exports.includeJade = path.join(__dirname, '../jade/mixins.jade');
