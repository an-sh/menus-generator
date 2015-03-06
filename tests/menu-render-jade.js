/*jshint multistr: true */

var path = require('path');
var util = require('util');
var vows = require("vows");
var assert = require("assert");
var jade = require('jade');
var compare = require('dom-compare').compare;
var jsdom = require('jsdom').jsdom;
var fg = require(path.join(__dirname, '../lib/menus-generator.js'));

function renderHelper(menu) {
  var opts = { 'filename' : __filename, 'menu' :  menu, pretty : true };
  return jade.render('include ../jade/mixins.jade\n+Menu(menu)', opts);
}

function compareHelper(htmlA, htmlE) {
  var DOMa = jsdom(htmlA);
  var DOMe = jsdom(htmlE);
  result = compare(DOMe, DOMa);
  assert.isEmpty(result.getDifferences());
}

vows.describe("Jade mixins")
  .addBatch({
    "Simple menu" : function() {
      var menu = (new fg.Menu("TMenu", null, null,
                              [ "item1" , "/url1" ],
                              [ "item2" , null ],
                              [ "item3" ])).getContent();
      var htmlE = '\
<ul id="TMenu">\
  <li id="TMenu-item1">\
    <a id="TMenu-item1--link" href="/url1">\
      <span id="TMenu-item1--label">TMenu-item1</span>\
    </a>\
  </li>\
  <li id="TMenu-item2">\
    <a id="TMenu-item2--link">\
      <span id="TMenu-item2--label">TMenu-item2</span>\
    </a>\
  </li>\
  <li id="TMenu-item3">\
    <a id="TMenu-item3--link">\
      <span id="TMenu-item3--label">TMenu-item3</span>\
    </a>\
  </li>\
</ul>';
      compareHelper(renderHelper(menu), htmlE);
    },
    "Complex menu" :  function() {
      var menu = (new fg.Menu("TMenu", null, { "class" : "menu" },
                              [ "item1" , "/url1", [
                                { "class" : "itemClass" },
                                { "class" : "linkClass" },
                                { "class" : "labelClass" } ]
                              ],
                              [ "item2" , "/url2", [
                                { "class" : "itemClass" },
                                { "class" : "linkClass" },
                                { "class" : "labelClass" },
                                { "class" : "submenuClass" } ],
                                ["item3", "/url3"] ,
                                ["item4", "/url4"] ],
                              [ "item5" , "/url5" ],
                              [ "item6" , "/url6" ])).getContent();
      var htmlE = '\
<ul id="TMenu">\
  <li id="TMenu-item1" class="itemClass">\
    <a id="TMenu-item1--link" class="linkClass" href="/url1">\
      <span id="TMenu-item1--label" class="labelClass">TMenu-item1</span>\
    </a>\
  </li>\
  <li id="TMenu-item2" class="itemClass">\
    <a id="TMenu-item2--link" class="linkClass" href="/url2">\
      <span id="TMenu-item2--label" class="labelClass">TMenu-item2</span>\
    </a>\
    <ul id="TMenu-item2--list" class="submenuClass">\
      <li id="TMenu-item3">\
        <a id="TMenu-item3--link" href="/url3">\
          <span id="TMenu-item3--label">TMenu-item3</span>\
        </a>\
      </li>\
      <li id="TMenu-item4">\
        <a id="TMenu-item4--link" href="/url4">\
          <span id="TMenu-item4--label">TMenu-item4</span>\
        </a>\
      </li>\
    </ul>\
  </li>\
  <li id="TMenu-item5">\
    <a id="TMenu-item5--link" href="/url5">\
      <span id="TMenu-item5--label">TMenu-item5</span>\
    </a>\
  </li>\
  <li id="TMenu-item6">\
    <a id="TMenu-item6--link" href="/url6">\
      <span id="TMenu-item6--label">TMenu-item6</span>\
    </a>\
  </li>\
</ul>';
      compareHelper(renderHelper(menu), htmlE);
    },
    "HTML insert" :  function() {
      var menu = (new fg.Menu("TMenu", null, null,
                              [ "item1" , "/url1" ])).getContent();
      var opts = { 'menu' :  menu, pretty : true };
      var html = jade.renderFile(path.join(__dirname, "render1.jade"), opts);
      var menuDOMa = jsdom(html);
      var menuDOMe = jsdom('\
<ul id="TMenu">\
  <li id="TMenu-item1"><span>element</span>\
    <a id="TMenu-item1--link" href="/url1">\
      <span id="TMenu-item1--label">TMenu-item1</span>\
    </a><span>element</span>\
  </li>\
</ul>');
      result = compare(menuDOMe, menuDOMa);
      assert.isEmpty(result.getDifferences());
    },
    "Render" :  function() {
      var menu = new fg.Menu("TMenu", null, null,
                             [ "item1" , "/url1" ]);
      var html = menu.render(jade, {pretty : true}, null, {"TMenu-item1--link::before" : "<span>element</span>", "TMenu-item1--link::after" : "<span>element</span>"} );
      var menuDOMa = jsdom(html);
      var menuDOMe = jsdom('\
<ul id="TMenu">\
  <li id="TMenu-item1"><span>element</span>\
    <a id="TMenu-item1--link" href="/url1">\
      <span id="TMenu-item1--label">TMenu-item1</span>\
    </a><span>element</span>\
  </li>\
</ul>');
      result = compare(menuDOMe, menuDOMa);
      assert.isEmpty(result.getDifferences());
    },
    "Render with mixin" :  function() {
      var menu = new fg.Menu("TMenu", null, null,
                             [ "item1" , "/url1" ]);
      var include = path.join(__dirname, "test.jade");
      var opts = { 'menu' :  menu, pretty : true };
      var html = menu.render(jade, {pretty : true}, null, {"TMenu-item1--link::before" : [ "tst" ], "TMenu-item1--link::after" : [ "tst" ]}, include );
      var menuDOMa = jsdom(html);
      var menuDOMe = jsdom('\
<ul id="TMenu">\
  <li id="TMenu-item1"><span>element</span>\
    <a id="TMenu-item1--link" href="/url1">\
      <span id="TMenu-item1--label">TMenu-item1</span>\
    </a><span>element</span>\
  </li>\
</ul>');
      result = compare(menuDOMe, menuDOMa);
      assert.isEmpty(result.getDifferences());
    },
    "Insert attributes" : function() {
      var menu = new fg.Menu("TMenu", null, null,
                             [ "item1" , "/url1" ]);
      var html = menu.render(jade, {pretty : true}, null, {"TMenu-item1--link::attributes" : { "class" : "c2" }, "TMenu-item1::attributes" : { "class" : "c1" } } );
      var menuDOMa = jsdom(html);
      var menuDOMe = jsdom('\
<ul id="TMenu">\
  <li id="TMenu-item1" class="c1">\
    <a id="TMenu-item1--link" href="/url1" class="c2">\
      <span id="TMenu-item1--label">TMenu-item1</span>\
    </a>\
  </li>\
</ul>');
      result = compare(menuDOMe, menuDOMa);
      assert.isEmpty(result.getDifferences());
    },
    "Insert attributes function" : function() {
      var menu = new fg.Menu("TMenu", null, null,
                             [ "item1" , "/url1" ],
                              [ "item2" , "/url2", null,
                                ["item3", "/url3"] ,
                                ["item4", "/url4"] ],
                              [ "item5" , "/url5" ],
                              [ "item6" , "/url6" ]);
      var insfn = function(name, level, isSubmenu) {
        if(name === "li" && !isSubmenu) {
          return { "class" : "itemClass" };
        } else if(level === 1 && name === "ul") {
          return { "class" : "submenuClass" };
        } else if(name === "li" && isSubmenu) {
          return { "class" : "titleClass" };
        } else {
          return {};
        }
      };
      var html = menu.render(jade, {pretty : true, "attrsExtender" :  insfn } );
      var menuDOMa = jsdom(html);
      var menuDOMe = jsdom('\
<ul id="TMenu">\
  <li id="TMenu-item1" class="itemClass">\
    <a id="TMenu-item1--link" href="/url1">\
      <span id="TMenu-item1--label">TMenu-item1</span>\
    </a>\
  </li>\
  <li id="TMenu-item2" class="titleClass">\
    <a id="TMenu-item2--link" href="/url2">\
      <span id="TMenu-item2--label">TMenu-item2</span>\
    </a>\
    <ul id="TMenu-item2--list" class="submenuClass">\
      <li id="TMenu-item3" class="itemClass">\
        <a id="TMenu-item3--link" href="/url3">\
          <span id="TMenu-item3--label">TMenu-item3</span>\
        </a>\
      </li>\
      <li id="TMenu-item4" class="itemClass">\
        <a id="TMenu-item4--link" href="/url4">\
          <span id="TMenu-item4--label">TMenu-item4</span>\
        </a>\
      </li>\
    </ul>\
  </li>\
  <li id="TMenu-item5" class="itemClass">\
    <a id="TMenu-item5--link" href="/url5">\
      <span id="TMenu-item5--label">TMenu-item5</span>\
    </a>\
  </li>\
  <li id="TMenu-item6" class="itemClass">\
    <a id="TMenu-item6--link" href="/url6">\
      <span id="TMenu-item6--label">TMenu-item6</span>\
    </a>\
  </li>\
</ul>');
      result = compare(menuDOMe, menuDOMa);
      assert.isEmpty(result.getDifferences());
    }
  })
  .export(module);
