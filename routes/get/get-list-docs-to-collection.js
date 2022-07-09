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
    let moModels = req.mongooseModels;
    
    let query = req.query;

    let moDocs = new moModels.docs;
    let doccoll = new moModels.doccoll;
    
    if((!query.id) || (!ObjectID.isValid(query.id))) {

        res.json(500, {'error': i18n.__('Error checking extension number')});
        return;
    }

    let arrFunc = [
        function(callback) {

            moModels.doccoll.find({_id: query.id, "serviceCollect" : 1}, null, null, callback);
        },
        function(serviceCollect, callback) {

            let findObj = {
                _id: query.id
            };
            
            if(serviceCollect.length < 1)
                findObj.author = mongoUsrID;
            
            doccoll.getCollections(findObj, null, null, callback);
        },
        function(step, callback) {
            
            if(!step)
                return callback();

            let colls = step.map(doccoll.attToTmpl);
            let docs = step[0].docs.map(moDocs.attToTmpl);
 
            let re = {
                 colls: colls
                ,docs: docs
            };

            callback(null, re);
        }
    ];
    
    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return next(new Error(err));
        
        if(!result) {
            
            res.toTemplates.docs = [{'empty': true}];
            
            res.status(200);
            res.render('partials/list-docs', res.toTemplates);
            return;
        }

        //res.toTemplates.colls = result.colls;
        res.toTemplates.listid = result.colls[0].id;

        res.toTemplates.docsCount = result.docs.length;
        res.toTemplates.docs = result.docs.length > 0 ? result.docs : [{'empty': true}];

        res.status(200);
        res.render('partials/list-docs', res.toTemplates);
    });

};
