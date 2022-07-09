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
    let doccoll = new moModels.doccoll;


    let onlyAdmin = req.checkAccess('admin');
    let report = req.checkAccess('reports');
    //let pao = req.checkAccess('expert-pao');
    //let nii = req.checkAccess('expert-nii');
    
    /*
     * Если это - Наблюдатель (пользователь с правами чтения)
     * То перенаправим
     */
    
    if(report)
        return next();


    let expert = req.checkAccess('expert-pao') || req.checkAccess('expert-nii');
    
    let query = req.query;

    if(query.id) {

        if(!ObjectID.isValid(query.id))
            return next(new HttpError(500, i18n.__('Error checking extension number')));
    }

    res.toTemplates.title = i18n.__('ND for classification (Menu)');

    let arrFunc = [
        function(callback) {

            return callback(null, null);
        }
        ,function(serviceCollect, callback) {

            let findObj = {
                $or: [{serviceCollect: 1}, {author: mongoUsrID}]
            };
            
            moModels.doccoll
                .find(findObj, null, {sort: 'createdAt'})
                .populate({
                    path: 'docs',
                    //match: match,
                    options: {sort: '-createdAt'}
                })
                .exec(callback);
        },
        function(step, callback) {

            if(!step)
                return callback();

            let k = 0;

            if(query.id)
                for(let i = 0; i < step.length; i++) {
                    let cItm = step[i];

                    if(!cItm)
                        continue;

                    if(!cItm.equals(query.id))
                        continue;

                    cItm.selected = true;

                    k = i;
                    break;
                }

            let colls = step.map(doccoll.attToTmpl);
            let docs = step[k].docs.map(moDocs.attToTmpl);
  

            docs.map(itm => {
                
                itm.onlyAdmin = onlyAdmin;
                
                // Возможность перейти в текст документа
                itm.classifispossible = true;

                itm.removeDoc = onlyAdmin;

                // !!!!
                //Классификация закончена
                if(itm.currTypeStep === 99)
                    return;
                
                let ext = itm.executors;
                
                if((!ext) || (!ext[mongoUsrID]))
                    return;
                
                let cuExt = ext[mongoUsrID];
                let notice = cuExt.notice || [];
                
                // Пользователь привязан, но сейчас не его этап анализа
                if(cuExt.typeStep.indexOf( itm.currTypeStep ) < 0)
                    return;
                
                itm.editing = true;
                
                // Уведомление в списке, ваш док на классификацию
                if(notice.indexOf(2) > -1)
                    itm.notifListDoc = true;

            });

            if(k === 0)
                colls[k].selected = 'selected';

            let re = {
                 colls: colls
                ,docs: docs
                ,listid: step[k].id
                ,serviceCollect: step[k].serviceCollect
                ,isRemove: !step[k].serviceCollect
            };

            callback(null, re);
        }
    ];


    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return next(err);

        if(!result) {

            res.toTemplates.colls = [{'empty': true}];
            res.toTemplates.docs = null;

            res.status(200);
            res.render('layouts/home', res.toTemplates);
            return;
        }

        res.toTemplates.colls = result.colls;
        res.toTemplates.listid = result.listid;
        
        res.toTemplates.docsCount = result.docs.length;

        res.toTemplates.docs = 
                (result.serviceCollect && result.docs.length) < 1 ? null : (result.docs.length > 0 ? result.docs : [{'empty': true}]);

        res.toTemplates.isRemove = result.isRemove;
        
        res.toTemplates.restScroll = 'data-rest-scroll="ing5phUKbW"';

        /*
         * Возможно, переделать это СПИД
         */

        if(req.url === '/')
            res.toTemplates.headerstart = 'header-start';


        res.status(200);
        res.render('layouts/home', res.toTemplates);
    });

};
