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

    let needDemand = null;
    
    let retJSON = {
        ok: 1,
        name: null,
        guids: []
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
            
            needDemand.classif.map(i => {

                if((!i.guids) || (i.guids.length < 1))
                    return;

                retJSON.guids = retJSON.guids.concat(i.guids);
            });
            
            retJSON.name = needDemand.name;

            callback(null, result);
        }
    ];

    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return res.json(500, {'error': err.message});

        res.json(retJSON);
        res.end();

    });
};