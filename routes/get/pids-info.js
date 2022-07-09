'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');

const HttpError = require(pathRoot +'/libs/http-error');

const userConf = require( pathRoot +'/config' );
const editClassifierConf = userConf[ 'site' ][ 'editClassifierAuth' ];

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

module.exports = ( req, res, next ) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    moModels.docs.find( null, null, null, ( err, docs ) => {
        res.json( docs );
    });
};
