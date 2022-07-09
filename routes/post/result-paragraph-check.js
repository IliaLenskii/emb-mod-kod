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

const log = require(pathRoot +'/libs/winston-init')(module);

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;


module.exports = (req, res, next) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;

    let moDocs = new moModels.docs;

    let userInfo = req.session.userInfo;

    let postData = req.body;
    let nd = postData.nd; //Номер дока ввиде кодекс
    let id = postData.id; //id дока в БД монго
    let idDemand = postData.id_demand; // id Требования сохран в доке выше
    let guids = postData.guids; // Классификаторы к требованию
    
    let needDemand = null;
    
    let retJSON = {
        ok: 1,
        counClassif: 0
    };

    let arrFunc = [
        function(callback){

            moModels.docs.findOne({nd: nd, 'demands._id': idDemand}, (err, doc) => {

                if(err)
                    return callback(new Error(err));

                if(!doc)
                    return callback(new Error(i18n.__('Invalid number document')));

                //if(!attrDoc.executors[mongoUsrID])
                //    return callback(new AccessError(i18n.__('For this document, you are not assigned as an expert')));
                
                doc.demands.map(i => {

                    if(i.equals(idDemand))
                        needDemand = i;
                });

                callback(null, doc);
            });            

        },
        function(result, callback){

            if(!guids) {

                needDemand.classif = [];
                
                return callback(null, result);
            }
            
            let newClassif = [];
            
            for (let key in guids) {
                let itm = guids[key];
                
                if((!itm) || (itm.length < 1))
                    continue;
                
                newClassif.push({
                    mainguid: key,
                    guids: itm
                });
            }
            
            needDemand.classif = newClassif;

            callback(null, result);
        },
        function(result, callback){
            
            result.save((err, resaveDoc) => {

                if(err)
                    return callback(err);

                callback(null, resaveDoc);
            });

        }
        ,function(result, callback){

            result.demands.map((currentValue) => {
                let cuVal = currentValue;

                if(cuVal.classif.length > 0)
                    retJSON.counClassif++;
            });

            retJSON.countDemandClassif = needDemand.classif.length;

            callback(null, null);
        }
    ];


    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return res.json(500, {'error': err.message});

        res.json(retJSON);
        res.end();

    });
};