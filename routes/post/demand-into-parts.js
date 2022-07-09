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
    let moNuReq = new moModels.numbeReq;
    
    let readyMade = new moModels.readyMade;

    let postData = req.body;

    let nameDemand = null;
    let nameREQ = null;

    let idDemand = postData.id_demand;
    let idDoc = postData.id;
    let ndDoc = postData.nd;
    let fromBroom = postData.from_broom;
    let isValidBroom = ObjectID.isValid(fromBroom);

    let selectedPid = [];
    
    if(postData.selectedpid)
        selectedPid = JSON.parse(postData.selectedpid);

    let classif = [];
    let extGuids = [];

    let pidsText = [];
    
    let broomDemId = null;

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

/*

Закрыть доступ!!!

<form name="demand-into-parts" method="post" enctype="multipart/form-data" autocomplete="off" action="demand-into-parts">
*/


    if(postData.name_demand) {

        nameDemand = postData.name_demand.replace(/[\\<>\/\'\"]/gi, '');

        if(nameDemand.length < 3)
            return res.json(500, {'error': i18n.__('Invalid value length')});
    }

    if(postData.id)
        if(!ObjectID.isValid(postData.id))
            return res.json(500, {'error': i18n.__('Error checking extension number')});


    let classifStart = false;
    let needDemand = null;

    let retJSON = {
        ok: 1,
        btnPaoDis: true,
        //id: result.id,
        //replace: true,
        html: null,
        counClassif: 0
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

            if(!isValidBroom)
                return callback(null, doc);
            
            moModels.readyMade.findById(fromBroom, (err, mades) => {

                if(err)
                    return callback(err);

                if((!mades) || (mades.length < 1))
                    return callback(null, doc);

                if(mades.classif.length < 1)
                    return callback(null, doc);

                mades.classif.forEach(itm => {

                    let o = {
                        mainguid: itm.mainguid,
                        guids: [].concat(itm.guids)
                    };

                    classif.push(o);
                    
                    extGuids = extGuids.concat(itm.guids);
                });

                callback(null, doc);
            });
        }
        ,function(doc, callback) {

            moNuReq.partNameReq({fromBroom: isValidBroom}, (err, nu) => {
                
                if(err)
                    return callback(err);
                
                nameREQ = nu.partNameReq;

                callback(null, doc);
            });
        }
        ,function(doc, callback) {

            let attrDoc = moDocs.attToTmpl( doc );

            if(isValidBroom && doc.demands.length > 0) {

                attrDoc.pidsGuids.forEach(itm => {

                    if(itm.pids.length !== selectedPid.length)
                        return;
                    
                    let str1 = JSON.stringify( (itm.pids).sort() );
                    let str2 = JSON.stringify( (selectedPid).sort() );
                    
                    if(str1 !== str2)
                        return;

                    idDemand = itm.id;
                });
            }

            classifStart = doc.demands.length < 1;
            
            if(!Number.isInteger(doc.demandsCounter))
                doc.demandsCounter = 0;

            doc.demandsCounter += 1;
            
            nameREQ += ''+ doc.demandsCounter;

            if(!nameDemand)
                nameDemand = nameREQ;

            let newDemand = {
                name: nameDemand,
                nameREQ: nameREQ,
                pids: selectedPid || [],
                pidsText: pidsText || [],
                classif: classif
            };

            if(idDemand) {
                
                let ii = null;
                
                newDemand = null;

                doc.demands.map((d, i) => {
                    
                    if(!d._id.equals(idDemand))
                        return;

                    newDemand = needDemand = d;
                    ii = i;
                });

                if(newDemand) {

                    if(postData.name_demand)
                        newDemand.name = nameDemand;

                    /*
                     * Беда
                     * Расстрелять за такой код
                     */
                    if(isValidBroom) {
                        
                        let objClassif = {};
                        
                        newDemand.classif.forEach(itm => {
                            
                            objClassif[itm.mainguid] = {
                                mainguid: itm.mainguid,
                                guids: [].concat(itm.guids)
                            };
                        });
                        
                        classif.forEach(itm => {

                            let mkl = objClassif[itm.mainguid];

                            if(!mkl) {

                                objClassif[itm.mainguid] = {
                                    mainguid: itm.mainguid,
                                    guids: [].concat(itm.guids)
                                };
                                
                                return;
                            }
                            
                            mkl.guids = mkl.guids.concat(itm.guids);
                            mkl.guids = [... new Set(mkl.guids) ];
                        });

                        let tous = [];
                        
                        for(let cx in objClassif) {

                            tous.push(objClassif[cx]);
                        }
                        
                        newDemand.classif = tous;

                    } else {

                        newDemand.pids = selectedPid || [];
                        newDemand.pidsText = pidsText || [];
                        newDemand.dateCreate = new Date();
                    }

                    doc.demands[ii] = newDemand;
                    
                    retJSON.replace = true;
                    retJSON.id_demand = broomDemId = newDemand._id;
                }
                
            } else {

                doc.demands.unshift(newDemand);
                
                broomDemId = doc.demands[0].id;
            }

            doc.save(function(err){
                
                if(err)
                    return callback(err);
                
                callback(null, doc);
            });
        }
        ,function(doc, callback) {
            
            if((!doc.demands) || (doc.demands.length < 1))
                return callback(null, doc);
            
            let demand = needDemand || doc.demands[0]; // Внимание на 0

            let obt = moDocs.demandAttToTmpl(demand);

            res.toTemplates.demands = [obt];

            retJSON.newName = i18n.__('Requirement') +' '+ (doc.demands.length + 1);

            retJSON.pids = demand.pids;
            retJSON.btnPaoDis = doc.demands.length > 0 ? false : true;


            if(isValidBroom)
                doc.demands.map((currentValue) => {
                    let cuVal = currentValue;

                    if(cuVal.classif.length > 0)
                        retJSON.counClassif++;
                });


            callback(null, doc);
        }
        ,function(doc, callback) {

            if(!isValidBroom)
                return callback(null, doc);

            if((!doc.demands) || (doc.demands.length < 1))
                return callback(null, doc);
            
            if(!broomDemId)
                return callback(null, doc);


            moModels.readyMade.findById(fromBroom, (err, mades) => {

                if(err)
                    return callback(err);

                if(!mades.demref)
                    mades.demref = [];
                
                let addNeed = true;

                mades.demref.map((d, i) => {

                    if(!d.equals(broomDemId))
                        return;

                    addNeed = false;
                });

                if(addNeed)
                    mades.demref.unshift( ObjectID(broomDemId) );

                mades.save((err) => {

                    if(err)
                        return callback(err);

                    callback(null, doc);
                });
            });
        }
        ,function(doc, callback) {

            if(!classifStart)
                return callback(null, doc);
            
            /*
             * Начало классификации
             * classifStart если переменная true только тогда что-то пишем в БД Postgress
             */
            req.userEvent( 'Start-classification', { comment: i18n.__('Classification-object-started') + doc.nd + ' (' + doc.name + ')' } );
            
            //имя - doc.name
            //ND - doc.nd
            
            callback(null, doc);
        }
    ];


    async.waterfall(arrFunc, (err, doc) => {

        if(err) {

            //if(err.message === 'Not null demand')
            //    return res.json({ok: 1, message: err.message}).end();
            
            return res.status(500).json({error: err.message});
        }

        res.render('partials/list-demand-itm', res.toTemplates, (err, html) => {

            if(err)
                return res.json(500, {error: err.message});

            retJSON.html = html;

            res.json(retJSON);
            res.end();
        });

    });
 
 
};
