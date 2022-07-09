'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');
const crypto = require('crypto');


const HttpError = require(pathRoot +'/libs/http-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

module.exports = (req, res) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    let moDocs = new moModels.docs;

    let moUsers = new moModels.users;
    
    let q = req.query;
    
    let buf = crypto.randomBytes(8).toString('hex');
    
    res.toTemplates.listid = buf;

    let guidExpRev = '60abb27f-37a8-ca06-03a2-74db071f5a42';

    let remoteUserList = [];

    let userList = [];
    //let stepList = [];

    let arrFunc = [
        function(callback){

            let condF = {
                step: {
                    $elemMatch: {
                        typeStep: 99,
                        stage: 1
                    }
                },
                demands: {
                    $elemMatch: {
                        'classif.mainguid': guidExpRev
                    }
                }
            };

            moModels.docs.find(condF).populate('step.executor').exec((err, docs) => {

                if(err)
                    return callback(err);

                if((!docs) || (docs.length < 1))
                    return callback(null, null);

                callback(null, docs);
            });
        },
        function(docs, callback) {
            
            moUsers.usersInfoMoAndRemot(req, (err, result) => {
                
                if(err) return next(err);

                remoteUserList = result;

                callback(null, docs);
            });
        },
        function(docs, callback) {

            userList = remoteUserList.map(i => {

                let a = {
                    name: i.name ? i.name : i.login,
                    login: i.login,
                    department: i.department,
                    id: i.id
                };

                if(i.name && i.name != i.login)
                    a.login2 = i.login;

                return a;
            });

            callback(null, docs);
        },
        function(docs, callback) {
            
            /*
            let attrDoc = moDocs.attToTmpl( docs[0] );

            attrDoc.step.map((itm, i) => {

                let a = {
                    name: itm.name2,
                    id: itm.typeStep
                };

                stepList.push(a);
            });
            */

            callback(null, docs);
        }
        ,function(docs, callback) {

            let filteredUserList = {};

            docs.map(d => {
                
                let attrDoc = moDocs.attToTmpl( d );
                
                for(let i = 0; i < userList.length; i++) {
                    let usLi = userList[i];

                    if(!usLi)
                        continue;

                    let exers = attrDoc.executors[usLi.id];

                    if(!exers)
                        continue;

                    if(exers.typeStep.indexOf(2) > -1)
                        continue;

                    filteredUserList[usLi.id] = usLi;
                }

            });

            userList = [];
            
            for(let i in filteredUserList) {

                userList.push( filteredUserList[i] );
            }

           callback(null, docs);
        }
    ];


    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return next(err);
        
        res.toTemplates.userList = userList;
        //res.toTemplates.stepList = stepList;

        res.status(200);
        res.render('partials/reports/reports-type-2-filter', res.toTemplates);
    });
};