'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');
const crypto = require('crypto');


const HttpError = require(pathRoot +'/libs/http-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

module.exports = (req, res) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    let moDocs = new moModels.docs;

    let moUsers = new moModels.users;
    
    let q = req.query;
    
    let buf = crypto.randomBytes(8).toString('hex');
    
    res.toTemplates.docs = [{empty: true}];
    
    res.toTemplates.listid = buf;

    let potrebDocs = [];
    
    let arrFunc = [
        function(callback){

            let condF = {

                step: {
                    $elemMatch: {
                        typeStep: 99,
                        stage: 1
                    }
                }
            };

            moModels.docs.find(condF, null, {sort: '-createdAt'}).exec((err, docs) => {

                if(err)
                    return callback(err);

                if((!docs) || (docs.length < 1))
                    return callback(null, null);

                callback(null, docs);
            });
        },
        function(docs, callback) {

            req.extReq.getClassifiers( ( err, output ) => {
                if ( err ) return next( err );

                let arrTrees = req.toULInForm( output, null, {dataRequired: 2} );

                res.toTemplates.arrTrees = arrTrees;

                callback(null, docs);
            });
        },
        function(docs, callback) {
            
            callback(null, docs);
        }
        ,function(docs, callback) {

            if(!docs)
                return callback(null, null);

            docs.map(d => {
                
                let attrDoc = moDocs.attToTmpl( d );
                
                let tAr = {
                     idx: potrebDocs.length + 1
                    ,id: attrDoc.id
                    ,name: attrDoc.name
                    ,allPid: attrDoc.allPid
                    
                    ,hasCheck: true
                };

                potrebDocs.push(tAr);
            });

           callback(null, docs);
        }
    ];


    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return next(err);


        if(potrebDocs.length > 0) {

            res.toTemplates.docs = potrebDocs;
            res.toTemplates.docsCount = potrebDocs.length;
        }


        res.status(200);
        res.render('partials/reports/reports-type-4-filter', res.toTemplates);
    });
};