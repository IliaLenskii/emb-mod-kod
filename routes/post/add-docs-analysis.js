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

const email = require( pathRoot +'/libs/email' );


module.exports = (req, res, next) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;

    let moDocs = new moModels.docs;
    let doccoll = new moModels.doccoll;

    let userInfo = req.session.userInfo;
    let moUsers = new moModels.users;

    let postData = req.body;
    let arrDocs = postData.docs || [];
    let arrStep = postData.step || [];
    
    if(postData.nd) {

        /*
        https://task.kodeks.ru/task/issues/19039

        При вызове этой команды КМ должны попадать в ПКл (<адрес кодвеба>/classification/add-docs-analysis/) и передать следующие данные: •link "Прямая" ссылка для перехода в текущий документ, на нужную вкладку с позиционирование на выбранном фрагменте. Если в реестре указан параметр SubscriptionHost, ссылка формируется в формате <SubscriptionHost>/<каталог>/<параметры ссылки>

        paragraph_title Название ближайшего к выделенному фрагменту текста раздела оглавления
        paragraph_content Текст выделенного фрагмента
        nd Значение Document.NumDoc
        codename Значение атрибута 1446 текущего документа
        title Значение атрибута 1 текущего документа
        inactive Если документ недействующий - значение 1. В других случаях значение не передается.

         */

        res.json(500, {'error': 'Логика пока не реализована'});
        return;
    }


    if(arrDocs.length < 1) {

        res.json(500, {'error': i18n.__('The array of documents is empty')});
        return;
    }

    
    /*
     * 
     * Список всех пользователей со всех кодвебов
     */
    
    let remoteUserList = [];
    
    let fullArrDocs = [];
    let fullArrStep = [].concat(arrStep);
    
    let saveCollectId = null;

    async.waterfall([
        function(callback){
        

            moUsers.usersInfoMoAndRemot(req, (err, result) => {
                
                if(err) return next(err);

                remoteUserList = result;

                callback(null, null);
            });

        },
        function(result, callback){

            fullArrStep = fullArrStep.map((currVal) => {

                if(!ObjectID.isValid(currVal.executorId))
                    return currVal;
                
                let stepId = currVal.executorId;
                let neUsr = currVal;
                
                remoteUserList.forEach(x => {

                    if((!x) || (!x.id))
                        return;

                    if(!ObjectID(x.id).equals(stepId))
                        return;

                    Object.assign(neUsr, x);
                });

                return neUsr;
            });

            callback(null, null);
        },
        function(result, callback){

            async.each(arrDocs, (nd, callback) => {

                moDocs._getKodeksDocInfo(nd, req, (err, docInfo) => {
                    
                    if(err)
                        return callback(new Error(err));

                    fullArrDocs.push(docInfo);

                    callback();
                });

            }, (err) => {

                if(err)
                    return callback(new Error(err));

                callback(null, null);
            });
        }
        ,function(result, callback){

            let saveDoc = [];

            async.each(fullArrDocs, (doc, callback) => {

                let nn = doc.name;
                    nn += doc.annotation || '';

                let condit = {
                    nd: doc.nd
                };

                let update = {
                     name: nn //doc.tooltip
                    ,nd: doc.nd
                    ,statusKod: doc.status
                    ,author: mongoUsrID
                };

                let opt = {
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true
                };
                
                moModels.docs.findOneAndUpdate(condit, update, opt, (err, ndoc) => {

                    if(err)
                        return callback(new Error(err));

                    if(ndoc.step.length < 1)
                        ndoc.step = moDocs.stepsDoc();

                    let resetFinalStep = null;
                    
                    fullArrStep.forEach((itm, i) => {
                        let fiItm = itm;
                        let stepItm = ndoc.step[i];
                        
                        if(!fiItm || !stepItm)
                            return;

                        
                        fiItm.typeStep = stepItm.typeStep;
                        
                        if(fiItm.executorId) {
                            
                            stepItm.executor = fiItm.executorId;
                            
                            // Уведомления по дефолту
                            stepItm.notice = [
                                {name: i18n.__('Notification of appointment as an expert'), typeNot: 1},
                                {name: i18n.__('Notification in the list of documents'), typeNot: 2}
                            ];
                            
                        } else {
                            
                            if(stepItm.executor)
                                stepItm.executor = undefined;
                            
                            /*
                            // Временно!!!!!!!!!!!!
                            // Сбросить курсор текущей стадии проверки
                            if(stepItm.typeStep === 1)
                                stepItm.current = 1;
                            else
                                stepItm.current = undefined;
                            */
                            
                            
                            //Сбросить все уведомления
                            stepItm.notice = [];

                            //stepItm.stage = 0;

                            //Сбросим дату передачи
                            //stepItm.dateTransfer = undefined;

                            resetFinalStep = true;
                        }
                    });


                    if(resetFinalStep)
                        ndoc.step.map(i => {
                            
                            if(!i)
                                return;
                            
                            if(i.typeStep === 99) {

                                //i.stage = 0;
                                //i.dateTransfer = undefined;
                                //i.current = undefined;
                            }
                        });


                    ndoc.save((err, resaveDoc) => {

                        if(err)
                            return callback(new Error(err));
                        
                        saveDoc.push( resaveDoc );

                        callback();
                    });

                });


            }, (err) => {

                if(err)
                    return callback(new Error(err));

                callback(null, saveDoc);
            });

        },
        function(saveDoc, callback){            

            moModels.doccoll.findOne({serviceCollect: 1}, (err, servColl) => {

               if(err)
                   return callback(err);
               
               if(!servColl)
                   return callback(new Error(i18n.__('Missing Default Collection')));
               
               
               let modocId = saveDoc.map(i => i.id);
               
               doccoll.addCollectionDocs(servColl.id, modocId, callback);
            });
        },
        function(result, callback){
            
            /*
             * 
             * Документы положили в папку без назначения экспертов
             * Нам пока это не интересно
             */            

            if(fullArrStep.length < 1)
                return callback(null, null);
            
            
            /*
             * Массив документов на классификацию
             */
            fullArrDocs;
            
            /*
             * Тут можно найти пользователе назначенных на классификацию
             * Необходимы объекты с typeStep значения 1 или 2
             * Приоритет использования атрибутов: имя, логин, пустая строка
             * 
             * В этом массиве можно взять email кому необходимо отправить письмо
             * Атрибут может отсутствовать, так и быть пустым ''
             */            
            fullArrStep;

            email( { users: fullArrStep, type: 'Add-docs-analisys', docs: fullArrDocs } );

            req.userEvent.eventFilter( 'Add-docs-analisys', ( err, result ) => {
                if ( !err ) result.forEach( ev => {
                    ev.comment = i18n.__('For document(s)') + ' '
                        + fullArrDocs.map( d => 'nd: ' + d.nd + '(' + d.tooltip + ')' ).join( ', ' ) + ' '
                        + i18n.__('List expert(s)')  + ' '
                        + fullArrStep.filter( e => e.login ).map( e => 'nd: ' + e.id + ' login: ' + e.login + ' name: ' + e.name + ' department: ' + e.department ).join( ', ' );
                });
            });

            callback(null, null);
        }
        
    ], (err, result) => {

        if(err)
            return res.json(500, {'error': err.message});

        let retJSON = {
            ok: 1
        };

        res.json(retJSON);
        res.end();

    });
};