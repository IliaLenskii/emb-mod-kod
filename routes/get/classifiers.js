'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');

const HttpError = require(pathRoot +'/libs/http-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

module.exports = ( req, res, next ) => {
    let mongoUsrID = req.session.mongoUsrID;
    let query = req.query;

    /**
     * Запрос на получение массива классификаторов
     */
    req.extReq.getClassifiers( ( err, output ) => {
        if ( err ) return next( err );

        res.toTemplates.title = i18n.__( 'Classifications (Menu)' );
        res.arrTreesNotHtml = output;
        res.toTemplates.arrTrees = req.toUL( output );
        res.status(200);
        res.render('layouts/classifiers', res.toTemplates);
    });
};
