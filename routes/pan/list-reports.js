'use strict';

let KsApi = global.KServerApi || {};

//const express = require('express');
//const router = express.Router();

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;
//const request = require('request');

const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');

const HttpError = require(pathRoot +'/libs/http-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

const soapClient = require( pathRoot + '/libs/soap-client' );


module.exports = async (req, res, next) => {

    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    let moDocs = new moModels.docs;

    //( async function() {
    // коннект к кодвебу
    let query = req.query;
    let nd = String(query.nd);


    let toArray = function (query, key) {
        var value =  query[key] || null;
        if(value){
            if(!Array.isArray(value))
                value = [value];
        }
        return value;
    }
    let arrReports = toArray(query, 'reports');
    let arrDocs = toArray(query, 'nd');
    let reports = [];

    let strnd = arrDocs.join('&nd=');

    for(let i in arrReports) reports.push({name: arrReports[i], nd: nd, strnd: strnd});
    if ((!nd) || (nd.length < 9))
        return next(new HttpError(404, i18n.__('Invalid number document')));

    let fullArrDocs = [];


    async.waterfall([
        (callback) => {
            moDocs.getMuchKodeksDocInfo(arrDocs, req, (err, docInfo) => {
                if (err)
                    return next(err);

                fullArrDocs = docInfo;
                callback(null, fullArrDocs);
            });
        }
    ], (err, result) => {
        if (result.length == 1) {
            res.toTemplates.title = result[0].name;
        } else {
            res.toTemplates.title = "Отчеты по группе документов (" + result.length + ")";
        }

        res.toTemplates.nd = arrDocs;
        res.toTemplates.strnd = strnd;
        res.toTemplates.strreports = arrReports;
        res.toTemplates.reports = reports;
        res.status(200);
        res.render('layouts/pan/list-reports', res.toTemplates);
    });





}
