'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const i18n = require('i18n');
const fs = require('fs');
const async = require('async');
const url = require('url');
const crypto = require('crypto');
const AccessError = require(pathRoot +'/libs/access-error');

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
    let typestep = parseInt(postData.typestep, 10);
    let back = parseInt(postData.back, 10);


    let onlyAdmin = req.checkAccess('admin');
    //let report = req.checkAccess('reports');
    
    let expert = req.checkAccess('expert-pao') || req.checkAccess('expert-nii');
    
    let editing = onlyAdmin;


    /*
     * Откат к началу классификации
     */
    if(typestep === 99) {

        back = 1;
        typestep = 1;
    }


    let retJSON = {
        ok: 1,
        editing: editing
    };

    let arrFunc = [
        function(callback){
            
            let condF = {
                nd: nd
            };
            
            if(!onlyAdmin && expert)
                condF.step = {
                    $elemMatch: {
                        typeStep: typestep,
                        executor: ObjectID(mongoUsrID)
                    }
                };

            moModels.docs.findOne(condF, (err, doc) => {

                if(err)
                    return callback(new Error(err));

                if(!doc)
                    return callback(new AccessError(403, i18n.__('This operation is not available to you')));

                callback(null, doc);
            });            

        },
        function(result, callback){

            if(back === 1)
                return callback(null, result);
            
            let nextStage = null;

            result.step.map((itm, i) => {
                
                itm.current = undefined;
                
                if(itm.typeStep !== typestep)
                    return;

                itm.stage = 1;
                itm.dateTransfer = Date.now();


                if(!nextStage)
                    nextStage = result.step[i + 1];
            });


            if(nextStage) {
                nextStage.current = 1;

                if(nextStage.typeStep === 99) {

                    nextStage.stage = 1;
                    nextStage.dateTransfer = Date.now();
                }
            }

            callback(null, result);
        },
        function(result, callback){

            if(back !== 1)
                return callback(null, result);

            /*
             * Откатимся до начала классификации
             */

            result.step.map(i => {

                // Сбросить курсор текущей стадии проверки
                if(i.typeStep === 1)
                    i.current = 1;
                else
                    i.current = undefined;

                i.stage = 0;
                i.dateTransfer = undefined;
            });

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

            let attrDoc = moDocs.attToTmpl( result );

            retJSON.greenBtn = attrDoc.currTypeStep === 2;

            retJSON.currTypeStep = attrDoc.currTypeStep;

            callback(null, result);
        }
        ,function(result, callback){

            //email( { users: fullArrStep, type: typestep === 1 ? 'Transfer-on-coordination' : 'Classification-coordination', docs: result } );

            req.userEvent( typestep === 1 ? 'Transfer-on-coordination' : 'Classification-coordination', {
                comment: i18n.__('For document') + ' nd: ' + result.nd + ',  ' + i18n.__('name') + " " + typestep === 1 ? i18n.__('Transfered') : i18n.__('Coordinated')
            });

            callback(null, result);
        }
    ];


    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return res.status(500).json({'error': err.message});

        res.json(retJSON);
        res.end();

    });
};