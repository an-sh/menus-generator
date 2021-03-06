
var path = require('path');
var util = require('util');
var vows = require("vows");
var assert = require("assert");
var i18n = require("i18n");
var fg = require(path.join(__dirname, '../lib/menus-generator.js'));


i18n.configure({
  locales: ['en'],
  directory: path.join(__dirname, './locales'),
  defaultLocale: 'en'
});


vows.describe("Translation")
  .addBatch({
    "Menu Expand" : {
      topic: function() {
        var m = new fg.Menu("TMenu", null, null,
                            [ "menu1" , "/url1" ],
                            [ "menu2" , "/url2",  { name : fg.__("_name") },
                              ["submenu1", "/url2a"],
                              ["submenu2", "/url2b"] ],
                            [ "menu3" , "/url3" ],
                            [ "menu4" , "/url4" ]);
        return m.getContent(i18n);
      },
      "length" : function (exp) {
        assert.strictEqual(exp.length, 4);
      },
      "submenu length" : function (exp) {
        assert.strictEqual(exp[1].length, 2);
      },
      "content translation" : function (exp) {
        assert.strictEqual(exp[0].label, "Menu1");
        assert.strictEqual(exp[1].label, "Menu2");
        assert.strictEqual(exp[1][0].label, "Submenu1");
        assert.strictEqual(exp[1][1].label, "Submenu2");
        assert.strictEqual(exp[2].label, "Menu3");
        assert.strictEqual(exp[3].label, "Menu4");
      },
      "attributes" : function (exp) {
        assert.strictEqual(exp[1].attrs.name, "Name");
      }
    }
  })
  .export(module);
