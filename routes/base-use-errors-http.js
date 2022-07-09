'use strict';

const i18n = require('i18n');
const util = require('util');
const HttpError = require('../libs/http-error');

module.exports = (app) => {
    
    let log = require('../libs/winston-init')(module);
    
    app.use(function(req, res, next){

        let statusCodes = 404;
        let accJs = req.accepts('json');
        
        let title = i18n.__('HTTPErrors.404.title');

        let description = i18n.__('HTTPErrors.404.description');
        
        log.error(statusCodes +' '+ req.originalUrl);

        if(accJs && req.xhr) {
            
            res.json(statusCodes, {'error': description});
            return;
            
        }
        
        res.toTemplates.title = title;
        
        res.toTemplates.errorTitle = title;
        res.toTemplates.errorDescription = description;
        
        res.toTemplates.statusCodes = statusCodes;

        res.status(statusCodes);
        res.render('partials/error/404', res.toTemplates);
    });

    /*
     * type HttpError handler
     */
    app.use(function(err, req, res, next) {
        
        if(util.isNumber(err)) {

            err = new HttpError(err);
        }
        
        if(!(err instanceof HttpError))
            return next(err);

        let statusCodes = err.status;
        let accJs = req.accepts('json');


        let title = res.toTemplates.errorTitle ?
                    res.toTemplates.errorTitle : 
                    i18n.__('HTTPErrors.'+ statusCodes +'.title');

        let description = res.toTemplates.errorDescription ?
                          res.toTemplates.errorDescription :
                          err.message;

        
        let errTolog = err.stack ? err.stack : err.message;
        
        log.error(errTolog);
        
        if(accJs && req.xhr) {
            
            res.status(statusCodes);
            res.json({error: description});
            return;
        }
        
        res.toTemplates.errorTitle = title;
        res.toTemplates.errorDescription = description;
        
        res.toTemplates.errorColorTriangle = '#D40808';

        //if(err.stack)
        //    res.toTemplates.errorStack = err.message;

        res.toTemplates.statusCodes = statusCodes;

        res.status(statusCodes);
        res.render('partials/error/500', res.toTemplates);
    });

    app.use(function(err, req, res, next) {

        let statusCodes = 500;
        let accJs = req.accepts('json');
        
        log.error(err.stack);
         
        if(accJs && req.xhr) {
            
            res.status(statusCodes);
            res.json({error: err.message});
            return;
        }
        
        //res.toTemplates.title = i18n.__('HTTPErrors.500.title');

        res.toTemplates.errorTitle = i18n.__('HTTPErrors.500.title');
        res.toTemplates.errorDescription = i18n.__('HTTPErrors.500.description');

        res.toTemplates.errorColorTriangle = '#D40808';

        res.toTemplates.statusCodes = statusCodes;
        res.toTemplates.errorStack = err.message;

        res.status(statusCodes);
        res.render('partials/error/500', res.toTemplates);
    });
    
};