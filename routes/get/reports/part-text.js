'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const i18n = require('i18n');
const async = require('async');

const url = require('url');

const HttpError = require(pathRoot +'/libs/http-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

module.exports = (req, res, next) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    let moDocs = new moModels.docs;

    let q = req.query;
    let id = q.id;
    let idMoObj = ObjectID(id);

    if(!id)
        return next(new HttpError(500, i18n.__('Error checking extension number')));

    if(!ObjectID.isValid(id))
        return next(new HttpError(500, i18n.__('Error checking extension number')));

    let demPids = [];

    let arrFunc = [
        function(callback){

            let condF = {
                'demands._id': ObjectID(id)
            };

            moModels.docs.findOne(condF, (err, doc) => {

                if(err)
                    return callback(err);

                if((!doc) /* || (doc.length < 1)*/)
                    return callback(new HttpError(404, i18n.__('Invalid number document')));

                callback(null, doc);
            });
        }
        ,function(doc, callback) {
            
            let attrDoc = moDocs.attToTmpl( doc );
            
            res.toTemplates.docName = attrDoc.name;

            attrDoc.pidsGuids.map(itm => {

                if(!idMoObj.equals(itm.id))
                    return;
                
                res.toTemplates.dialogTitle = itm.name;
                
                demPids = itm.pids;

                /*
                itm.pidsText.map((t, i, cuarr) => {

                    //text.push( t.text );
                    
                    demPids.push( t.pid );
                });
                */
            });

           callback(null, doc);
        }
        ,function(doc, callback) {

            ( async function() {

                    let path = `/kdocapi` + await new Promise( ( r, j ) => {
                        req.kdoc.getContentList( doc.nd, ( err, result ) => {
                            
                            r( result.data.getContentList[ 0 ].html );
                        });
                    });

                    let text = await new Promise( ( r, j ) => {
                        let pid = demPids.join( ',' );

                        let options = {
                            path: path + `?range=${ pid }`,
                            host: global.KServerApi.VDirInfo.Hostname,
                            port: global.KServerApi.VDirInfo.Port,
                            headers: req.headers
                        };
                        
                        req.extReq.xhr( ( err, result ) => {
                            if ( err ) res.send( err );
                            r( result );
                        }, options );
                    });
                    
                    text = text.replace( /<style>[\s\S]*?<\/style>/g, '');

                    res.toTemplates.text = text;
                    
                    //console.log( text );

//                    potrebDocs[ n ].texts = potrebDocs[ n ].texts
//                            .replace( /<style>[\s\S]*?<\/style>/g, '' )
//                            .replace( /<\/p>\n[\s\S]*?<p[\s\S]*?>/g, '\r\n\r\n' )
//                            .replace( /\r\n\r\n[\b]*/g, '\r\n\r\n' )
//                            .replace( /<\/?[\s\S]*?>/g, '' ).trim();
                

                callback(null, doc);
            })();
        }
    ];


    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return next(err);

/*
        if(potrebDocs.length > 0) {

            res.toTemplates.itms = potrebDocs;
            res.toTemplates.docsCount = potrebDocs.length;
        }
*/

        res.status(200);
        res.render('partials/reports/part-text', res.toTemplates);
    });
};