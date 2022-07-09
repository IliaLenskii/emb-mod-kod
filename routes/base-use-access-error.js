'use strict';

const i18n = require('i18n');
const util = require('util');
const HttpError = require('../libs/http-error');
const AccessError = require('../libs/access-error');


module.exports = (app) => {

    app.use(function(err, req, res, next) {
        
        if(!(err instanceof AccessError))
            return next(err);


        //if(util.isNumber(err))
        //    err = new HttpError(err);
        
        let statusCodes = err.status;
        let accJs = req.accepts('json');


        let title = res.toTemplates.errorTitle ?
                    res.toTemplates.errorTitle : 
                    i18n.__('HTTPErrors.'+ statusCodes +'.title');

        let description = res.toTemplates.errorDescription ?
                          res.toTemplates.errorDescription :
                          err.message;


        //let errTolog = err.stack ? err.stack : err.message;
        
        if(accJs && req.xhr) {
            
            res.status(statusCodes);
            res.json({error: description});
            return;
        }

        res.toTemplates.statusCodes = statusCodes;
        
        res.toTemplates.errorTitle = title;
        res.toTemplates.errorDescription = description;

        res.toTemplates.hideTopMenu = true;

        res.status(statusCodes);
        res.render('partials/error/403', res.toTemplates);
    });

};

