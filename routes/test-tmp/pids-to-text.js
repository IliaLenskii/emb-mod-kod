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

    let postData = req.body;
    
    let creator = req.checkAccess('creator');

    if(!creator)
        return res.status(403).json({error: i18n.__('This operation is not available to you')});

    let nameDemand = String(postData.name_demand);
        nameDemand = nameDemand.replace(/[\\<>\/\'\"]/gi, '');

    let idDemand = postData.id_demand;
    let idDoc = postData.id;
    let ndDoc = postData.nd;

    let selectedPid = null;

    let pidsText = [];

    if(postData.pidstext)
        postData.pidstext.forEach(itm => {

            if((!itm.pid) || (!itm.text))
                return;
            
            let toa = {
                pid: parseInt(itm.pid, 10),
                text: itm.text
            };

            if(itm.info)
                toa.info = JSON.parse( itm.info );

            pidsText.push(toa);
        });

    if(pidsText.length < 1)
        return res.status(500).json({error: i18n.__('empty')});


    if(postData.id)
        if(!ObjectID.isValid(postData.id))
            return res.status(500).json({error: i18n.__('Error checking extension number')});

    let retJSON = {
        ok: 1
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

            doc.demands.forEach(function(dem){

                dem.pidsText = [];

                pidsText.forEach(function(pt){

                    if(!pt)
                        return;

                    let pid = pt.pid;

                    if(dem.pids.indexOf(pid) < 0)
                        return;

                    dem.pidsText.push(pt);
                });

            });

            doc.save(function(err){
                
                if(err)
                    return callback(err);
                
                callback(null, doc);
            });
        }
    ];

    async.waterfall(arrFunc, (err, doc) => {

        if(err)
            return res.status(500).json({error: err.message});

        res.json(retJSON);
        res.end();
    });
 
};