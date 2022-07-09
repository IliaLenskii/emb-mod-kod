'use strict';

let KsApi = global.KServerApi || {};

const express = require('express');
const router = express.Router();

const log = require('../libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');

const HttpError = require('../libs/http-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

const handlebarsCompile = require('../libs/handlebars-compile');


/*
 * Если это - Наблюдатель (пользователь с правами чтения)
 * То перенаправим
 */

/*
router.get('*', function(req, res, next) {

    let report = req.checkAccess('reports');

    if(!report)
        return next();
    
    let rep4 = require(__dirname +'/get/reports-type-4');
    
    rep4.apply(this, Array.prototype.slice.call(arguments));
});
*/


router.get('/',
    require(__dirname +'/get/home'),
    require(__dirname +'/get/reports/reports-type-4') //Отчёты для наблюдателей
);

/*
 * 
 * Страница набора значений классификатора
 */

router.get('/ready-made/', require(__dirname +'/get/ready-made'));
router.get('/ready-made/ready-made-add/', require(__dirname +'/get/ready-made-add'));


/*
 * 
 * Страница атрибутного поиска по ИСУНД АСУТП
 */

router.get('/attribute-search/', require(__dirname +'/get/attribute-search'));

router.get('/attribute-search-form/', require(__dirname +'/get/attribute-search-form'));

/*
 * 
 * Получить список пользователей относящихся к плагину
 */

router.get('/users-list/', require(__dirname +'/get/users-list'));



/*
 * 
*/

router.get('/doc/', require(__dirname +'/get/doc'));

router.get('/search-results-kod/', require(__dirname +'/get/search-results-kod'));


/*
 * 
 */

//router.get('/get-list-docs-to-collection/', require(__dirname +'/get/get-list-docs-to-collection'));

/*
 * Ленский сам удалить, но чуть позже
 */

/*
router.get('/diff-classif/', function(req, res, next) {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    
    let query = req.query;
    
    res.toTemplates.title = 'diff-classif';  

    res.status(200);
    res.render('layouts/diff-classif', res.toTemplates);
});

router.get('/compare-report/', function(req, res, next) {
    
    res.toTemplates.title = 'compare-report';
    
    res.status(200);
    res.render('layouts/compare-report', res.toTemplates);
});
*/

router.get('/classifiers/', require(__dirname +'/get/classifiers'));

router.get('/pids-info/', require(__dirname +'/get/pids-info'));

router.get('/classifiers/edit-classifier/', require(__dirname +'/get/edit-classifier'));


/*
 * Страница формирования отчётов
 */

router.get('/reports/', require(__dirname +'/get/reports/reports'));

/*
 * Отчёт 1 типа
 */

router.get('/reports/type-1', require(__dirname +'/get/reports/reports-type-1'));
router.get('/reports/reports-type-1-filter', require(__dirname +'/get/reports/reports-type-1-filter'));

/*
 * Отчёт 2 типа
 */

router.get('/reports/type-2', require(__dirname +'/get/reports/reports-type-2'));
router.get('/reports/reports-type-2-filter', require(__dirname +'/get/reports/reports-type-2-filter'));


/*
 * Отчёт 3 типа
 */

router.get('/reports/type-3', require(__dirname +'/get/reports/reports-type-3'));
router.get('/reports/reports-type-3-filter', require(__dirname +'/get/reports/reports-type-3-filter'));


/*
 * Отчёт 4 типа. Отчёты для наблюдателей
 */

router.get('/reports/type-4', require(__dirname +'/get/reports/reports-type-4'));
router.get('/reports/reports-type-4-filter', require(__dirname +'/get/reports/reports-type-4-filter'));


/*
 * Отчёты
 * Получить текст требования из kDoc
 */
router.get('/reports/part-text', require(__dirname +'/get/reports/part-text'));


module.exports = router;