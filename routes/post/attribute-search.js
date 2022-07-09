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

module.exports = (req, res) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    let buf = crypto.randomBytes(8).toString('hex');

    let postData = req.body;

    /*
     * Ошибка
     */

    // res.json(500, {error: 'error'}); 
    
    /*
     * Нет подходящих доков
     */
     // res.json({'docsCount': 0});
     
     
     /*
      * Доки есть, сохраняем в сессию. Возвращаем listid
      */
     
    let arrLs = [
        /*
        {name: 'Док 1', nd: 123456789},
        {name: 'Док 2', nd: 123456788},
        {name: 'Док 3', nd: 123456787},
        {name: 'Док 4', nd: 123456786},
        {name: 'Док 5', nd: 123456786},
        {name: 'Док 6', nd: 123456786},
        {name: 'Док 7', nd: 123456785},
        {name: 'Док 8', nd: 123456784},
        {name: 'Док 9', nd: 123456783},
        {name: 'Док 10', nd: 123456732},
        {name: 'Док 11', nd: 123456722},
        {name: 'Док 12', nd: 3453456723}
        */
    ];

    let retObj = {
        docs: arrLs,
        docsCount: arrLs.length,
        //'typeSearch': typeSearch,
        ok: true
    };

    req.session.searchKodCache[buf] = retObj;

    let retJSON = {
        ok: 1,
        listid: buf
    };

    res.json(retJSON);
};