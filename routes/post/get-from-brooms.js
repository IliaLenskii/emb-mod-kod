'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const i18n = require('i18n');
const fs = require('fs');
const async = require('async');
const url = require('url');
const crypto = require('crypto');

const util = require('util');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;


module.exports = (req, res, next) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;

    let readyMade = new moModels.readyMade;
    let moDocs = new moModels.docs;

    let userInfo = req.session.userInfo;

    let postData = req.body;

    let idDoc = postData.id_doc;
    let pidDoc = parseInt(postData.pid, 10);

    let retJSON = {
        ok: 1,
        mades: []
    };

    let arrFunc = [
        function(callback) {

            moModels.docs.findById(idDoc, (err, doc) => {

                if(err)
                    return callback(err);
                
                if(!doc)
                    return callback(new Error(i18n.__('Invalid number document')));

                callback(null, doc);
            });
        }
        ,function(doc, callback) {

            let attrDoc = moDocs.attToTmpl( doc );

            if(doc.demands.length < 1)
                return callback(null, doc);
            
            let arrIdDem = [];

            attrDoc.pidsGuids.forEach(itm => {
                
                let isPi = itm.pids.indexOf(pidDoc);
                
                if(isPi < 0)
                    return;
                
                arrIdDem.push( ObjectID(itm.id) );
            });


            if(arrIdDem.length < 1)
                return callback(null, doc);

            let condF = {
                demref:{ $in: arrIdDem }
            };

            moModels.readyMade.find(condF, (err, mades) => {

                if(err)
                    return callback(err);

                if((!mades) || (mades.length < 1))
                    return callback(null, doc);
                
                mades.forEach(itm => {

                    retJSON.mades.push(itm.id);
                });

                callback(null, doc);
            });
            
        }
    ];

    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return res.json(500, {error: err.message});

        res.json(retJSON);
        res.end();

    });
};