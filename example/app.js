
// require
var path = require('path');
var util = require('util');
var express = require('express');
var router = express.Router();
var i18n = require('i18n');
var mg = require(path.join(__dirname, '../lib/menus-generator.js'));

// seting Express and Jade
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.pretty = true;
app.use(express.static(path.join(__dirname, 'public')));

var langMenu = new mg.Menu(
  "langMenu", null, null,
  [ "en", "?locale=en" ],
  [ "ru", "?locale=ru" ]);

var exampleMenu = new mg.Menu(
  "exampleMenu", null, null,
  [ "item1", "#item1" ],
  [ "item2", "#item2" ],
  [ "cat1", "#cat1", null,
    [ "item3", "#item3" ],
    [ "item4", "#item4" ] ],
  [ "cat2", "#cat2", null,
    [ "item5", "#item5" ],
    [ "item6", "#item6" ] ]);


var usedLocales = ['en', 'ru'];
// configuring i18n
i18n.configure({
  locales: usedLocales,
  directory: path.join(__dirname, './locales'),
  defaultLocale: 'en'
});
app.use(i18n.init);

// configuring fg locales
// auto adding form ids to all locales files
mg.setLocalesGeneration(i18n, usedLocales);

// Adding index GET route
router.get("/", function(req, res) {
  i18n.overrideLocaleFromQuery(req);
  res.render("index", {
    exampleMenu: exampleMenu.getContent(req),
    langMenu: langMenu.getContent(req),
    locale: req.getLocale()
  });
});

// mounting router with form and index routes
app.use('/', router);

// application 404 route
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// application error route
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});

// export express application
module.exports = app;
