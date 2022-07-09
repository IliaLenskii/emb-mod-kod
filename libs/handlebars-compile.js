'use strict';

const KsApi = global.KServerApi || {};
const pathRoot = KsApi.RootPath;

const log = require(__dirname +'/winston-init')(module);
const handlebars_helpers = require(__dirname +'/helpers');
const handlebars = require('express-handlebars').create();

function handlebarsCompile(filePath, context, callback) {

    const templatesPath = (pathRoot +'/views');
    const fillFilePath = templatesPath +'/'+ filePath;
    
    handlebars.getTemplate(fillFilePath, {cache: KsApi.pluginProduction}).then(ret => {
        
        let html = ret(context, {
            layout: null,
            defaultLayout: null,
            //extname: '.html',
            helpers: handlebars_helpers
        });

        callback(null, html);
    })
    .catch(error => {

        callback(new Error(error));
    });
    
    return true;
};

module.exports = handlebarsCompile;
