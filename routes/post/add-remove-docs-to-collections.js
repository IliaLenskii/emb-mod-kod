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

const AccessError = require(pathRoot +'/libs/access-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

const log = require(pathRoot +'/libs/winston-init')(module);

module.exports = (req, res) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;

    //let moDocs = moModels.docs;
    let doccoll = new moModels.doccoll;
    
    let onlyAdmin = req.checkAccess('admin');

    let postData = req.body;

    let action = postData.action;
    let collection_id = postData.collection_id;
    
    if(collection_id) {

        if(!ObjectID.isValid(collection_id)) {

            res.json(500, {'error': i18n.__('Error checking extension number')});
            return;
        }
    }
    
    let retJSON = {
        ok: 1,
        action: action
    };

    if(action === 'add') {

        doccoll.addCollectionDocs(collection_id, postData.id, (err, result) => {

            if(err)
                return res.json(500, {'error': err.message});

            retJSON.length = result.docs.length;

            res.json(retJSON);
            res.end();
        });
    }
    

    if(action === 'del') {
        
        if(!onlyAdmin)
            return res.json(403, {error: i18n.__('Active license not exists')});

        doccoll.delCollectionDocs(collection_id, postData.nd, (err, result) => {

            if(err)
                return res.json(500, {'error': err.message});

            res.json(retJSON);
            res.end();
        });

    }
};