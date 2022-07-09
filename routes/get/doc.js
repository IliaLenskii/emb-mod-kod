'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');

const HttpError = require(pathRoot +'/libs/http-error');
const AccessError = require(pathRoot +'/libs/access-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

module.exports = (req, res, next) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    let moDocs = new moModels.docs;
    
    let readyMade = new moModels.readyMade;

    let query = req.query;
    let nd = query.nd;
    let stage = query.stage;
    
    if((!nd) || (nd.length < 9))
        return next(new HttpError(404, i18n.__('Invalid number document')));
    
    let onlyAdmin = req.checkAccess('admin');
    //let report = req.checkAccess('reports');
    
    let expert = req.checkAccess('expert-pao') || req.checkAccess('expert-nii');
    
    let editing = false;
    let matching = false;

    res.toTemplates.title = i18n.__('docjs-document');
    res.toTemplates.originalUrl = req.baseUrl + '/doc/';
    
    res.toTemplates.hideTopMenu = true;
    
    res.toTemplates.doc = {};
    res.toTemplates.demands = [{empty: true}];
    res.toTemplates.readyMade = [{empty: true}];
    
    res.toTemplates.demandsCounClassif = 0;
    
    res.toTemplates.btnPaoDis = true;
    
    res.toTemplates.currTypeStep = null;
    
    res.toTemplates.greenBtn = '';  
    
    let arrFunc = [
        function(callback) {

            let match = {
                nd: nd
            };

            moModels.docs.findOne(match, (err, doc) => {

                if(err)
                    return callback(new Error(err));

                if(!doc)
                    return callback(new HttpError(404, i18n.__('Invalid number document')));
                
                let attrDoc = moDocs.attToTmpl( doc );

                res.toTemplates.doc = attrDoc;
                
                res.toTemplates.currTypeStep = attrDoc.currTypeStep;
                
                /*
                res.toTemplates.demandNewName = i18n.__('Requirement');

                if(doc.demands.length > 0)
                    res.toTemplates.demandNewName += ' '+ (doc.demands.length + 1);
                */

                res.toTemplates.title = attrDoc.nameToTitle;

                callback(null, doc);
            });
        }
        ,function(doc, callback) {
            
            if((!doc.demands) || (doc.demands.length < 1))
                return callback(null, doc);
            
            let counClassif = 0;
            let arrPids = [];
            
            let demands = doc.demands.map((currentValue) => {
                let cuVal = currentValue;
                let obt = moDocs.demandAttToTmpl(cuVal);

                if(cuVal.classif.length > 0)
                    counClassif++;

                arrPids = arrPids.concat(obt.pids);

                return obt;
            });
            

            arrPids = arrPids.filter((itm, i, farr) => {

                return farr.indexOf(itm) === i;
            });


            res.toTemplates.demands = demands;
            res.toTemplates.demandsCounClassif = counClassif;
            
            res.toTemplates.btnPaoDis = demands.length > 0 ? false : true;
            
            res.toTemplates.arrPids = JSON.stringify(arrPids);

           callback(null, doc);
        }
        ,function(doc, callback) {

            let attrDoc = res.toTemplates.doc;

            if(attrDoc.currTypeStep === 2)
                res.toTemplates.greenBtn = '__green_btn';


            if(onlyAdmin) {

                matching = true;
                
                editing = attrDoc.currTypeStep === 1;

                return callback(null, doc);
            }
            
            /*
             * Для эксперта классификация закончилась
             */
            if(attrDoc.currTypeStep === 99)
                return callback(null, doc);


            if(!expert)
                return callback(null, doc);


            let ext = attrDoc.executors;

            if((!ext) || (!ext[mongoUsrID]))
                return callback(null, doc);

            let cuExt = ext[mongoUsrID];

            // Пользователь привязан, но сейчас не его этап анализа
            if(cuExt.typeStep.indexOf( attrDoc.currTypeStep ) < 0)
                return callback(null, doc);
            
            //Только согласование
            if(attrDoc.currTypeStep === 2) {
                
                matching = true;
                
                return callback(null, doc);
            }

            editing = true;

            callback(null, doc);
        }
        ,function(doc, callback) {

            res.toTemplates.editing = editing;
            res.toTemplates.matching = matching;

            callback(null, doc);
        }
        ,function(doc, callback) {

            req.extReq.getClassifiers( ( err, output ) => {
                if ( err ) return next( err );

                let arrTrees = editing ? req.toULInForm( output ) : req.toULInFormNoEdit( output );

                res.toTemplates.arrTrees = arrTrees;

                callback(null, doc);
            });
        }
        ,function(doc, callback) {
            let cond = {
                public: 1
            };
                        
            let condAuthor = {
                author: ObjectID(mongoUsrID),
                public: 0
            };
            moModels.readyMade.find({$or:[cond, condAuthor]}, null, {sort: '-createdAt'}, (err, mades) => {

                if(err)
                    return callback(err);

                if((!mades) || (mades.length < 1))
                    return callback(null, doc);
                
                let ma = [];

                mades.map(i => {
                    
                    let f = readyMade.attToTmpl(i);
                    
                    ma.push( f );
                });

                res.toTemplates.readyMade = ma;
                
                callback(null, doc);
            });

        }        
    ];

    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return next(err);

        res.status(200);
        res.render('layouts/doc', res.toTemplates);
    
    });

};
