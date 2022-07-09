'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');

const HttpError = require(pathRoot +'/libs/http-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

module.exports = (req, res, next) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    let moDocs = new moModels.docs;

    let readyMade = new moModels.readyMade;
    let moUsers = new moModels.users;
    
    let userInfo = req.session.userInfo;

    let query = req.query;
    let nd = query.nd;

    if((!nd) || (nd.length < 9))
        return next(new HttpError(404, i18n.__('Invalid number document')));

    let remoteUserList = [];

    let step = [];
    let userList = [];
    
    res.toTemplates.nd = nd;

    let arrFunc = [
        function(callback){

            moUsers.usersInfoMoAndRemot(req, (err, result) => {
                
                if(err) return next(err);

                remoteUserList = result;

                callback(null, null);
            });
        },
        function(result, callback) {

            if(!nd)
                return callback(null, null);

            moModels.docs.findOne({nd: nd}).populate('step.executor').exec((err, doc) => {

                if(err)
                    return callback(new Error(err));

                if(!doc)
                    return callback(null, null);

                callback(null, doc);
            });
        }
        ,function(doc, callback) {

            if(!doc)
                return callback(null, null);

            if((!doc.step) || (doc.step.length < 1))
                return callback(null, null);

            step = doc.step.map(i => {
                
                if(!i)
                    return null;

                let pl = {
                    //name: i.name,
                    //stage: i.stage
                };
                
                if(i.executor)
                remoteUserList.forEach(x => {
                    
                    if(!i.executor._id.equals(x.id))
                        return;
                    
                    pl.executorLogin = x.login;
                    pl.executorName = x.name ? x.name : x.login;
                    
                    pl.department = x.department;
                    
                    pl.executorId = i.executor.id;
                    
                    if(x.name && x.name != x.login)
                        pl.login2 = x.login;
                });

                return pl;
            });

           callback(null, doc);
        }
        ,function(doc, callback) {

           callback(null, doc);
        }
        ,function(doc, callback) {

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

            callback(null, doc);
        }
    ];


    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return next(new HttpError(500, err.message));

        res.toTemplates.step = step;
        res.toTemplates.userList = userList;
        
        res.render('partials/appoint-experts', res.toTemplates, (err, html) => {

            if(err)
                return next(new HttpError(500, err.message));

            res.send(html);
            res.end();
        });

    });
 
};

