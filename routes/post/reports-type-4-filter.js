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

    let postData = req.body;

    let guids = postData.guids || {};
    let _ids = postData._id;

    let retJSON = {
        count: 0
    };

    if(!_ids) {
        
        res.json(retJSON);
        res.end();
        return;
    }

    let condF = null;
    let arrCoGuids = [];
    
    let filterSession = {};

    let arrFunc = [
        function(callback){

            let arrCoId = _ids.map(i => ({_id: ObjectID(i)}) );

            for (let key in guids) {
                let itm = guids[key];

                if((!itm) || (itm.length < 1))
                    continue;

                arrCoGuids = arrCoGuids.concat(itm);
            }

            condF = {
                $and: [
                    {$or: arrCoId},
                    {step: {
                        $elemMatch: {
                            typeStep: 99,
                            stage: 1
                        }
                    }}
                ]
            };


            if(arrCoGuids.length > 0) {

                condF.$and.push({
                    'demands.classif.guids': {
                        //$in: arrCoGuids
                        $all: arrCoGuids
                    }
                });
                
                filterSession.arrCoGuids = arrCoGuids;
            }

            filterSession.condF = condF;

            moModels.docs.find(condF, null, {sort: '-createdAt'}, (err, docs) => {

                if(err)
                    return callback(err);

                if((!docs) || (docs.length < 1))
                    return callback(null, null);
                
                retJSON.count = docs.length;

                callback(null, docs);
            });
        }
    ];

    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return res.json(500, {'error': err.message});

        let buf = crypto.randomBytes(8).toString('hex');
        
        filterSession.filterid = buf;

        retJSON.filterid = buf;

        req.session.searchKodCache[buf] = filterSession;

        res.json(retJSON);
        res.end();
    });
};