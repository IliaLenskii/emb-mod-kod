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
    
    let name_doc = postData.name_doc || '';
        name_doc = name_doc.trim();

    let typestep = postData.typestep;
    let step = postData.step;
    
    let guidExpRev = '60abb27f-37a8-ca06-03a2-74db071f5a42';

    let retJSON = {
        count: 0
    };

    if(!name_doc && !typestep && !step) {

        res.json(retJSON);
        res.end();
        return;    
    }

    let condF = null;
    
    let filterSession = {};

    let arrFunc = [
        function(callback){

            condF = {
                $and: []
            };
            
            condF.$and.push({
                step: {
                    $elemMatch: {
                        typeStep: 99,
                        stage: 1
                    }
                }
            });

            condF.$and.push({
                demands: {
                    $elemMatch: {
                        'classif.mainguid': guidExpRev
                    }
                }
            });


            if(name_doc)
                condF.$and.push({$text: {$search: name_doc}});

            let executorId1 = null;
            
            if(Array.isArray(step)) {

                if(step[0].executorId)
                    executorId1 = ObjectID(step[0].executorId);
            }

            if(executorId1)
                condF.$and.push({step: {
                    $elemMatch: {
                        executor: executorId1,
                        typeStep: 1
                    }
                }});

/*
            if(typestep) {
                
                condF.$and.push({step: {
                    $elemMatch: {
                        typeStep: typestep,
                        current: 1
                    }
                }});
            }
*/

            filterSession.condF = condF;

            moModels.docs.find(condF, null, null).populate('step.executor').exec((err, docs) => {

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