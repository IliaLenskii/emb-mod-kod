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

module.exports = (req, res) => {
    let mongoUsrID = req.session.mongoUsrID;

    res.toTemplates.title = i18n.__('Requirements analysis (Menu)');

    res.status(200);
    res.render('layouts/pan/req-analysis', res.toTemplates);
};
