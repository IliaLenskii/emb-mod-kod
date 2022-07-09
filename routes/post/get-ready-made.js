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
    
    let isBroom = postData.broom === '1';
    let idDoc = postData.id_doc;

    let retJSON = {
        ok: 1,
        guids: [],
        toul: null
    };

    let arrFunc = [
        function(callback){

            moModels.readyMade.findOne({_id: postData.id}, (err, doc) => {

                if(err)
                    return callback(new Error(err));

                if(!doc)
                    return callback(new Error(i18n.__('Invalid number document')));

                callback(null, doc);
            });            

        },
        function(result, callback){

            result.classif.map(i => {

                if((!i.guids) || (i.guids.length < 1))
                    return;

                retJSON.guids = retJSON.guids.concat(i.guids);
            });

            callback(null, result);
        },
        function(result, callback) {

            if((!isBroom) || (retJSON.guids.length < 1))
                return callback(null, result);

            req.extReq.getClassifiers( ( err, output ) => {
                if ( err ) return next( err );
                
                let neo = output.reduce((prev, curr) => {

                    let ch = {
                        title: curr.title ? curr.title: curr.text,
                        guid: curr.guid,
                        children: []
                    };

                    if(!curr.children)
                        return prev;

                    let flatObj = req.toHashTableClassif([curr])[0];
                    
                    if(!flatObj)
                        return prev;
                    
                    retJSON.guids.forEach((gu) => {
                        
                        let tuqu = flatObj[gu];

                        if(!tuqu)
                            return;

                        ch.children.push(tuqu);
                    });
                    
                    if(ch.children.length < 1)
                        return prev;
                    
                    prev.push(ch);
                    
                    return prev;

                }, []);

                if(neo.length < 1)
                    return callback(null, result);

                let toUl = req.toULInFormNoEdit(neo);

                retJSON.toul = toUl.join('');

                callback(null, result);
            });
        },

        function(result, callback) {

            if((!isBroom) || (retJSON.guids.length < 1))
                return callback(null, result);
            
            if(!result.demref)
                return callback(null, result);
            
            if(result.demref.length < 1)
                return callback(null, result);


            moModels.docs.findById(idDoc, (err, doc) => {

                if(err)
                    return callback(err);
                
                if(!doc)
                    return callback(new Error(i18n.__('Invalid number document')));
                
                let attrDoc = moDocs.attToTmpl( doc );
                
                let arrMkPid = [];

                attrDoc.pidsGuids.forEach(itm => {
                    
                    let kocs = result.demref.indexOf(itm.id);
                    
                    if(kocs < 0)
                        return;
                    
                    arrMkPid = arrMkPid.concat(itm.pids);
                });


                retJSON.pids = [... new Set(arrMkPid)];

                callback(null, result);
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