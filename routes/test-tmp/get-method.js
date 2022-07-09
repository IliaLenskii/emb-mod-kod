'use strict';

const KsApi = global.KServerApi || {};
const pathRoot = KsApi.RootPath;

const express = require('express');
const router = express.Router();

const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

const handlebarsCompile = require(pathRoot +'/libs/handlebars-compile');


router.get('/super-test/', function(req, res) {

    res.status(200);
    //res.end('/super-test/');
    //res.end(/dsfdasdfsdfsdfsg/);
});


router.get('/add-test-list-docs/', function(req, res, next) {
    
    let mongoUsrID = req.session.mongoUsrID;

    let moModels = req.mongooseModels;

    
    let moDocs = new moModels.docs;
    
    //let arrDd = [456057755, 456045266, 420392537, 420392536, 420392535, 420392534, 420392533, 420392532, 420392531, 420392530, 420392529, 420392645, 420392643, 420392642, 420392640, 420392639, 420392637, 420392636, 420392635, 420392490, 420392590, 420392226, 420392225, 456045434, 420392606, 420392546, 420392545, 420392544, 420392543, 420392542, 420392426, 420392419, 420392410, 420392266, 420392420, 420392271, 420392270, 420392269, 420392089, 420392088, 420392087, 456044508, 456044495, 456044182, 456043743, 420392096, 420392095, 420392094, 420392093, 420392092, 420392091, 420392090, 456044661, 456042630, 420392547, 420392097, 420391973, 420391972, 420391971, 420391917, 420391916, 456044376, 456044373, 456044255, 456044133, 456044132, 456043331, 456042903, 456042902, 456042900, 456042899, 456042898, 420392421, 420391812, 420392422, 420392272, 420391730, 456044254, 456044203, 456043727, 456042512, 456042449, 456042418, 420391930, 420391919, 420391742, 420391741, 420391740, 420391739, 420391738, 420391737, 420391736, 420391735, 420391734, 420391733, 420391732, 420391639, 456044368, 456044367, 456044253];
    
    let arrDd = [420249121,420250578,420255080,420249164,420249091,420268125];

    moDocs.getMuchKodeksDocInfo(arrDd, req.KServer.session, (err, arrDocs) => {

        async.each(arrDocs, (itmDoc, callback) => {
            
            let attrSaveDoc = {
                 'name': itmDoc.tooltip
                ,'author': mongoUsrID
                ,'nd': itmDoc.nd
            };

            moDocs._saveDoc(attrSaveDoc, (err, saveDoc) => {

                callback();
            });
            
        }, (err) => {

            res.status(200);
            res.end('- wrt ok -');
        });
    });

});

module.exports = router;