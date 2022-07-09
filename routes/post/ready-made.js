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


module.exports = (req, res, next) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;

    let readyMade = new moModels.readyMade;

    let userInfo = req.session.userInfo;

    let postData = req.body;
    let guids = postData.guids; // Классификаторы к требованию
    
    let set_made = (postData.set_made_ctx == "on") ? 0 : 1;

    let name_made = String(postData.name_made).trim();
    let id_made = postData.id_made;

/*
    if(id_made) {

        if(!ObjectID.isValid(id_made))
            return next(new HttpError(500, i18n.__('Error checking extension number')));
    }
*/

    if(postData.remove) {

        let condit = {
            _id: ObjectID(id_made)
        };

        moModels.readyMade.findOneAndRemove(condit, (err, result) => {

            if(err)
                return res.json(500, {'error': err.message});

            let retJSON = {
                ok: 1
            };

            res.json(retJSON);
            res.end();
        });

        return;
    }


    if((name_made.length < 3) || (name_made.length > 200)) {

        res.json(500, {'error': i18n.__('Invalid value length')});
        return;
    }

    let classif = [];

    for (let key in guids) {
        let itm = guids[key];

        if((!itm) || (itm.length < 1))
            continue;

        classif.push({
            mainguid: key,
            guids: itm
        });
    }

    if(classif.length < 1) {

        res.json(500, {'error': i18n.__('Could not find suitable classifiers')});
        return;
    }


    let condit = {};

    if(id_made)
        condit._id = ObjectID(id_made);
    else
        condit.name = i18n.__('New Selection')+ '_XXX';

    let update = {
        name: name_made,
        author: mongoUsrID,
        classif: classif,
        public: set_made 
    };

    let opt = {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
    };

    moModels.readyMade.findOneAndUpdate(condit, update, opt, (err, result) => {

        if(err)
            return res.json(500, {'error': err.message});

        let tp = readyMade.attToTmpl(result);

        res.toTemplates.readyMade = [tp];

        res.render('partials/lists/ready-made-itm', res.toTemplates, (err, html) => {

            let retJSON = {
                ok: 1,
                html: null
            };

            if(err)
                return res.json(500, {'error': err.message});

            retJSON.html = html;

            res.json(retJSON);
            res.end();
        });
        
    });
    
};