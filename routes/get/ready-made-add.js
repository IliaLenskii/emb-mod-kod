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

module.exports = (req, res, next) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    
    let readyMade = new moModels.readyMade;
    
    let q = req.query;
    let id_made = q.id;
    
/*
    if(id_made) {

        if(!ObjectID.isValid(id_made))
            return next(new HttpError(500, i18n.__('Error checking extension number')));
    }
*/
    
    res.toTemplates.name_made = i18n.__('New Selection');

    let arrFunc = [
        function(callback){

            req.extReq.getClassifiers( ( err, output ) => {
                if ( err ) return next( err );

                let arrTrees = req.toULInForm( output, null, {dataRequired: 2} );

                res.toTemplates.arrTrees = arrTrees;

                callback(null, null);
            });
        },
        function(result, callback) {
            
            let condF = {
            };
            
            if(id_made)
                condF._id = ObjectID(id_made);

            moModels.readyMade.find(condF, (err, mades) => {

                if(err)
                    return callback(err);

                if((!mades) || (mades.length < 1))
                    return callback();

                if(id_made) {

                    let f = readyMade.attToTmpl(mades[0]);

                    res.toTemplates.name_made = f.name;
                    res.toTemplates.id = f.id;

                    res.toTemplates.preloadguids = JSON.stringify(f.guids);
                    res.toTemplates.set_made = f.public;

                } else {
                    
                    res.toTemplates.name_made = i18n.__('New Selection') +' '+ (++mades.length);
                    res.toTemplates.set_made = 'checked';
                }

                callback(null, mades);
            });
        }
    ];


    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return next(err);

        res.status(200);
        res.render('partials/lists/ready-made-add', res.toTemplates);
    });
};