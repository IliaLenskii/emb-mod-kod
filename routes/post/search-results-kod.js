'use strict';

/*
 * 
 * Чуть позже удалить
 * 
 */

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const express = require('express');
const router = express.Router();

const i18n = require('i18n');
const fs = require('fs');
const async = require('async');
const url = require('url');
const crypto = require('crypto');

const util = require('util');

const log = require(pathRoot +'/libs/winston-init')(module);

module.exports = (req, res) => {
    let postData = req.body;
    let buf = crypto.randomBytes(8).toString('hex');
    
    let retJSON = {
        listid: buf
    };

    if(!postData.docs)
        return res.json(retJSON);

    let jsonDocs = null;

    try {

        jsonDocs = JSON.parse(postData.docs);
    } catch(e){}

    if(jsonDocs)
        req.session.searchKodCache[buf] = jsonDocs;

    /*
     * Серый, это для тебя
     * sc - необходимо сохранять как "comment"
     * 
     */

    let params = {};
        params[i18n.__('Enter a phrase to search for')] = jsonDocs.query;
    
    let sc = {comment:{
        type: 'attr',
        params: params
    }};

    /*
     * -------------
     */

    retJSON.listid = buf;

    res.json(retJSON);
};