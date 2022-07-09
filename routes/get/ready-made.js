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

    let readyMade = new moModels.readyMade;

    let query = req.query;

    res.toTemplates.title = i18n.__('Saved sets of classifier values', '');
    res.toTemplates.readyMade = [{empty: true}];

    let arrFunc = [
        function(callback) {
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
                    return callback();
                
                let ma = [];

                mades.map(i => {
                    
                    let f = readyMade.attToTmpl(i);
                    
                    ma.push( f );
                });

                res.toTemplates.readyMade = ma;
                res.toTemplates.readyMadeCount = ma.length;

                callback(null, mades);
            });
        }
        /*
        ,function(mades, callback) {

            callback(null, null);
        }
        */
    ];


    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return next(err);

        res.status(200);
        res.render('layouts/ready-made', res.toTemplates);
    });

};
