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

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

module.exports = (req, res) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;

    //let moDocs = moModels.docs;
    let doccoll = new moModels.doccoll;

    let postData = req.body;

    let oldId = null;
    let nameCollections = String(postData.name_collections);
    let nameCollRepl = nameCollections.replace(/[^a-zА-яЁё0-9_\-. ]/gi, '');


    if((nameCollRepl.length < 3) || (nameCollRepl.length > 40)) {
        
        res.status(500).json({error: i18n.__('Invalid value length')});
        return;
    }


    if(postData.id) {

        if(!ObjectID.isValid(postData.id)) {

            res.status(500).json({error: i18n.__('Error checking extension number')});
            return;
        }
        
        oldId = postData.id;
    }


    if(postData.remove) {

        let condit = {
            _id: ObjectID(oldId),
            author: ObjectID(mongoUsrID),
            serviceCollect: {
                $not:{$eq: 1}
            }
        };

        moModels.doccoll.findOneAndRemove(condit, (err, result) => {

            if(err)
                return res.status(500).json({error: err.message});

            let retJSON = {
                ok: 1
            };

            res.json(retJSON);
            res.end();
        });

        return;
    }    

    let folder = new moModels.doccoll({
        name: nameCollRepl,
        author: mongoUsrID,
        removable: true
    });

    folder.save(function(err, result){

        if(err)
            return res.status(500).json({error: err.message});

        let retJSON = {
            ok: 1,
            id: result.id,
            html: null
        };

        let parr = {
            layout: null,
            colls: [ doccoll.attToTmpl(result) ]
        };

        res.render('partials/list-collections-itm', parr, (err, html) => {

            if(err)
                return res.status(500).json({error: err.message});

            retJSON.html = html;

            res.json(retJSON);
            res.end();
        });

    });

};
