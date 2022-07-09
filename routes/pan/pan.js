'use strict';

const express = require('express');
const router = express.Router();

const i18n = require('i18n');
const async = require('async');

const HttpError = require('../../libs/http-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;


/*
 * /classification/pan
 */ 
/*
router.get('/', (req, res, next) => {
    
    res.toTemplates.title = 'Pan'; //i18n.__('ND for classification.b');
    
    res.status(200);
    res.render('layouts/pan/pan', res.toTemplates);
});
*/
router.get('/', require(__dirname +'/attribute-search'));

router.get('/attribute-search/', require(__dirname +'/attribute-search'));

router.get('/attribute-search-form/', require(__dirname +'/attribute-search-form'));

router.get('/reports/', require(__dirname +'/reports'));
//router.get('/reports/disablednd/', require(__dirname +'/reports/disablednd'));
router.get('/list-reports/', require(__dirname +'/list-reports'));


router.get('/analytics-reporting/', require(__dirname +'/attribute-search'));
router.get('/req-analysis/', require(__dirname +'/req-analysis'));


router.get('/ok', (req, res, next) => {
    
    res.toTemplates.title = 'Pan-1'; //i18n.__('ND for classification.b');
    
    res.status(200);
    res.render('layouts/pan/pan_1', res.toTemplates);
});


router.post('/', (req, res, next) => {
    
    res.status(200);
    res.render('layouts/pan/pan', res.toTemplates);
});


module.exports = router;