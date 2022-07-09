'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;

const fs = require('fs');
const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');

module.exports.GetServerInfo = (a, callback) => {

    if(KsApi.GetServerInfo)
        KsApi.GetServerInfo().then((info) => {

            info.mURL = info.Protocol+ '://'+ info.Hostname + (info.Port !== 80 ? ':' + info.Port : '') + '/';
            info.VDURL = info.mURL + info.PreferredVDir;

            callback(null, info);

        }).catch((err) => {

            callback(err);
        });
    else
        callback(new Error('global.KServerApi.GetServerInfo is undefined'));
       
};
