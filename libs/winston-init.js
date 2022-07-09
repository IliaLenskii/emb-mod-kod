'use strict';

const winston = require('winston');

//info - debug - error

function othLogger(module) {

    let KsApi = global.KServerApi || {};

    let logsPath = KsApi.LogsPath;
    let path = module.filename.split(/\/|\\/).slice(-2).join('/');
    
    let transports = [];

    transports.push(
        new winston.transports.File({
            'filename': logsPath +'/winston.log'
            ,'json': false
            ,'maxsize': (1024 * 1024 * 50)
            ,'maxFiles': 12
            ,'timestamp': true
            ,'label': path
            ,'level': 'debug'
        })
    );


    if(!KsApi.pluginProduction)
    transports.push(
        new winston.transports.Console({
             'colorize' : true
            ,'label': path
        })
    );

    var w = new winston.Logger({
        'transports': transports
    });

    return w;
}

module.exports = othLogger;