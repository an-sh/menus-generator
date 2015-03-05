
var path = require('path');
var vows = require("vows");
var assert = require("assert");
var fg = require(path.join(__dirname, '../lib/menus-generator.js'));

vows.describe("Menu definitions parser")
  .addBatch({
    "Simple menu" : {
      topic: function() {
        return new fg.Menu("TMenu", null, {"class" : "nav"},
                           [ "menu1" , "/url1", {"class" : "main"},
                             [ "submenu1", "/url2", {"class" : "sub"}]]);
      },
      "type" : function (menu) {
        assert.instanceOf(menu, fg.Menu);
      },
      "id" : function (menu) {
        assert.strictEqual(menu.skel.id, "TMenu");
      },
      "attributes" : function (menu) {
        assert.strictEqual(menu.skel.attrs["class"], "nav");
      },
      "length" : function (menu) {
        assert.strictEqual(menu.skel.length, 1);
      },
      "entry id" : function (menu) {
        assert.strictEqual(menu.skel[0].id, "TMenu-menu1");
      },
      "entry href" : function (menu) {
        assert.strictEqual(menu.skel[0].linkAttrs.href, "/url1");
      },
      "entry label type" : function (menu) {
        assert.isFunction(menu.skel[0].label);
      },
      "entry label value" : function (menu) {
        assert.strictEqual(menu.skel[0].label().toString(), "TMenu-menu1");
      },
      "entry attributes" : function (menu) {
        assert.strictEqual(menu.skel[0].attrs["class"], "main");
      },
      "submenu length" : function (menu) {
        assert.strictEqual(menu.skel[0].length, 1);
      },
      "submenu entry id" : function (menu) {
        assert.strictEqual(menu.skel[0][0].id, "TMenu-submenu1");
      },
      "submenu entry href" : function (menu) {
        assert.strictEqual(menu.skel[0][0].linkAttrs.href, "/url2");
      },
      "submenu entry label type" : function (menu) {
        assert.isFunction(menu.skel[0][0].label);
      },
      "submenu entry label value" : function (menu) {
        assert.strictEqual(menu.skel[0][0].label().toString(), "TMenu-submenu1");
      },
      "submenu entry attributes" : function (menu) {
        assert.strictEqual(menu.skel[0][0].attrs["class"], "sub");
      }
    },
    "Global translation IDs" : {
      topic: function() {
        return new fg.Menu("TMenu", { i18nNoPrefix : true }, {"class" : "nav"},
                           [ "menu1" , "/url1", {"class" : "main"},
                             [ "submenu1", "/url2", { "class": "submain"}]]);
      },
      "entry label type" : function (menu) {
        assert.isFunction(menu.skel[0].label);
      },
      "entry label value" : function (menu) {
        assert.strictEqual(menu.skel[0].label(), "menu1");
      },
      "submenu entry label type" : function (menu) {
        assert.isFunction(menu.skel[0][0].label);
      },
      "submenu entry label value" : function (menu) {
        assert.strictEqual(menu.skel[0][0].label(), "submenu1");
      }
    },
    "Translation IDs escaping" : {
      topic: function() {
        return new fg.Menu("TMenu", null, {"class" : "nav"},
                           [ fg.nTP("menu1") , "/url1", {"class" : "main"},
                             [ fg.nTP("submenu1") , "/url2", { "class": "submain"}]]);
      },
      "entry label type" : function (menu) {
        assert.isFunction(menu.skel[0].label);
      },
      "entry label value" : function (menu) {
        assert.strictEqual(menu.skel[0].label().toString(), "menu1");
      },
      "submenu entry label type" : function (menu) {
        assert.isFunction(menu.skel[0][0].label);
      },
      "submenu entry label value" : function (menu) {
        assert.strictEqual(menu.skel[0][0].label().toString(), "submenu1");
      }
    },
    "Complex menu" : {
      topic: function() {
        return new fg.Menu("TMenu", null, null,
                           [ "menu1" , "/url1" ],
                           [ "~menu2" , "/url2", null,
                             ["submenu1", "/url2a"],
                             ["~submenu2", "/url2b"] ],
                           [ "menu3" , "/url3" ],
                           [ fg.nTP("menu4") , "/url4" ]);
      },
      "length" : function (menu) {
        assert.strictEqual(menu.skel.length, 4);
      },
      "submenu length" : function (menu) {
        assert.strictEqual(menu.skel[1].length, 2);
      },
      "ids" : function (menu) {
        assert.strictEqual(menu.skel[0].id, "TMenu-menu1");
        assert.strictEqual(menu.skel[1].id, "TMenu-menu2");
        assert.strictEqual(menu.skel[1][0].id, "TMenu-submenu1");
        assert.strictEqual(menu.skel[1][1].id, "TMenu-submenu2");
        assert.strictEqual(menu.skel[2].id, "TMenu-menu3");
        assert.strictEqual(menu.skel[3].id, "TMenu-menu4");
      },
      "label values" : function (menu) {
        assert.strictEqual(menu.skel[0].label().toString(), "TMenu-menu1");
        assert.strictEqual(menu.skel[1].label().toString(), "menu2");
        assert.strictEqual(menu.skel[1][0].label().toString(), "TMenu-submenu1");
        assert.strictEqual(menu.skel[1][1].label().toString(), "submenu2");
        assert.strictEqual(menu.skel[2].label().toString(), "TMenu-menu3");
        assert.strictEqual(menu.skel[3].label().toString(), "menu4");
      },
    },
    "Errors checking" : {
      "duplicate ids" : function() {
        assert.throws(function() { new fg.Menu("TMenu", null, null,
                                               [ "menu1" , "/url1" ],
                                               [ "menu1" , "/url1" ]);},
                      Error);
        assert.throws(function() { new fg.Menu("TMenu", null, null,
                                               [ "menu1" , "/url1", null,
                                                 [ "menu1" , "/url1" ]]);},
                      Error);
      },
      "non-string ids" : function() {
        assert.throws(function() { new fg.Menu( 1 , null, null,
                                                [ "menu1" , "/url1" ]);},
                      Error);
        assert.throws(function() { new fg.Menu("TMenu", null, null,
                                               [ 1 , "/url1" ]);},
                      Error);
      },
      "wrong attributes type" : function() {
        assert.throws(function() { new fg.Menu("TMenu", null, "string",
                                               [ "menu1" , "/url1" ]);},
                      Error);
        assert.throws(function() { new fg.Menu("TMenu", null, null,
                                               [ "menu1", "/url1", "string" ]);},
                      Error);
      },
      "no entries specification" : function() {
        assert.throws(function() { new fg.Menu("TMenu", null, null);},
                      Error);
      }
    }
  })
  .export(module);
