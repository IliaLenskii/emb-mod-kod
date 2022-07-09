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

const log = require(pathRoot +'/libs/winston-init')(module);

module.exports = (req, res) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;

    let moDocs = new moModels.docs;
    let readyMade = new moModels.readyMade;

    let postData = req.body;

    let idDemand = postData.id_demand;
    let idDoc = postData.id;
    let ndDoc = postData.nd;

    let retJSON = {
        ok: 1,
        btnPaoDis: true,
        demandsCounClassif: 0
    };

    let arrFunc = [
        function(callback) {

            let update = {
                 $pull: { demands: { _id: idDemand } }
            };

            let opt = {
                //new: true,
                //upsert: true,
                //setDefaultsOnInsert: true
            };

            moModels.docs.findByIdAndUpdate(idDoc, update, opt, (err, doc) => {

                if(err)
                    return callback(err);
                
                if(!doc)
                    return callback(new Error(i18n.__('Invalid number document')));
                
                moModels.docs.findById(idDoc, callback);
            });
        }
        ,function(doc, callback) {
            
            let objIdD = ObjectID(idDemand);

            let condit = {
                demref: objIdD
            };

            let update = {
                $pull: { demref: objIdD }
            };

            moModels.readyMade.update(condit, update, { multi: true }, (err, made) => {

                callback(null, doc);
            }); 
        }
        ,function(doc, callback) {

            let counClassif = 0;
            
            doc.demands.map((currentValue) => {
                let cuVal = currentValue;

                if(cuVal.classif.length > 0)
                    counClassif++;
            });

            retJSON.demandsCounClassif = counClassif;
            retJSON.btnPaoDis = doc.demands.length > 0 ? false : true;

            callback(null, doc);
        }
    ];


    async.waterfall(arrFunc, (err, doc) => {

        if(err)
            return res.json(500, {'error': err.message});
        
        res.json(retJSON);
        res.end();
    });
};
