'use strict';

/*
 * 
 * Чуть позже удалить
 * 
 */

let KsApi = global.KServerApi || {};

//const express = require('express');
//const router = express.Router();

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');

const HttpError = require(pathRoot +'/libs/http-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

const handlebarsCompile = require(pathRoot +'/libs/handlebars-compile');

module.exports = (req, res) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    let moDocs = new moModels.docs;
    let doccoll = new moModels.doccoll;
    
    let query = req.query;
    let listid = query['listid'];
    let cacheIdList = null;
    
    let onlyAdmin = req.checkAccess('admin');
    
    res.toTemplates.hideTopMenu = true;

    if(listid) {

        cacheIdList = req.session.searchKodCache[listid];
    } else {
        
        res.toTemplates.searchError = ' ';
        
        res.render('layouts/search-results-kod', res.toTemplates);
        return;
    }

    if(!cacheIdList) {
        
        res.toTemplates.searchError = i18n.__('Could not find document list cache');

        res.render('layouts/search-results-kod', res.toTemplates);
        return;
    }
 
 
    res.toTemplates.searchQuery = cacheIdList.query;
    res.toTemplates.docsCount = cacheIdList.docsCount;
    res.toTemplates.listid = listid;
    

    if(cacheIdList.error) {

        res.toTemplates.searchError = cacheIdList.error;

        res.render('layouts/search-results-kod', res.toTemplates);
        return;
    }
    
    let arrJSDocs = [].concat( (cacheIdList.docs || []) );
    
    if(arrJSDocs.length < 1) {
        
        res.toTemplates.searchError = i18n.__('The result returned an empty list of documents');

        res.render('layouts/search-results-kod', res.toTemplates);
        return;
    }

   async.waterfall([
        function(callback) {
            
            let qOr = [];
            
            arrJSDocs.forEach((item) => {

                if(item.nd)
                    qOr.push({'nd': item.nd});
            });

            //db.inventory.find( { $or: [ { quantity: { $lt: 20 } }, { price: 10 } ] } )

            moDocs.getDocs({$or: qOr}, null, null, (err, result) => {
                
                if(err)
                    return callback(err);
                
                let onlNd = result.docs.map(ob => ob.nd);
                
                let docs = arrJSDocs.map((item, i) => {

                    if(!item)
                        return null;

                    item['noindb'] = onlNd.indexOf(item.nd) < 0;
                    
                    item.name = String(item.name).replace(/\n/ig, "<br />");
                    
                    item.onlyAdmin = onlyAdmin;

                    return item;
                });

                callback(err, docs);
            });
        }
        ,function(docs, callback) {
            
            //item['sub-to-classif'] = true;

/*
            if(!docs)
                return callback(null, null);

            let onlNd = docs.map(ob => ob.nd);

            let docsTml = arrJSDocs.map((item, i) => {

                if(!item)
                    return null;

                if(onlNd.indexOf(item.nd) < 0)
                    item['sub-to-classif'] = true;

                return item;
            });
*/
            
            callback(null, docs);
        }
/*
        ,function(doc, callback) {

            let serAttr = {
                _idocs: doc.id,
                author: mongoUsrID
            };

            checkColl.findOne(serAttr, function(err, docCheck){

                if(err)
                    return callback(new Error(err));

                if(!docCheck)
                    return callback(null, doc);

                let savePid = [];
                
                let pargr = docCheck.paragraphs;

                for(let i = 0; i < pargr.length; i++) {
                    let itm = pargr[i];

                    if(!itm)
                        continue;

                    let pid = itm['pid'];

                    if(!pid)
                        continue;

                    let pos = checkMyMet.abbrevEntryD(itm);

                    savePid.push( pos );
                }

                try {

                    if(savePid.length > 0)
                        res.toTemplates.checkPids = JSON.stringify(savePid);

                } catch (e){}
                

                res.toTemplates.countParagraphs = pargr.length;
                
                res.toTemplates.hidSBtn = (pargr.length < 1);


                res.toTemplates.checkComplete = docCheck.complete;

               callback(null, doc);
            });

        }
        */
    ], function (err, docs) {

        if(err)
            return next(err);

/*
        arrJSDocs = arrJSDocs.map((item, i) => {

            if(!item)
                return null;

            item['sub-to-classif'] = true;

            return item;
        });
*/

        res.toTemplates.docs = docs;

        //res.status(200);
        res.render('layouts/search-results-kod', res.toTemplates);
    });


/*
var bob = {
    'nd': lItm.NumDoc,
    'annot': self.getAnnotatInfo({'doc': lItm})
};

var retObj = {
    'docs': arrLs,
    'docsCount': arrLs.length,
    'ok': true,
    'error': 'asfsd sdfsdf'
};

let prodJson = {};

if(util.isString(result)) {

    try {

        prodJson = JSON.parse(result);
    } catch(caerr){}
}

    req.session.searchKodCache[buf] =  postData.docs;


    let retJSON = {
        'listid': buf
    };
 */

    
/*
 VDirInfo	Object	(Object) #<Object>	
    moDocs.getMuchKodeksDocInfo(456087596 , req.KServer.session, (err, arrDocs) => {
        
        log.info(arrDocs[0].tooltip);
        
        err;

    });
    
    KsApi.VDirInfo = result;
    
*/


    //let classifColl = new moModels.classifiers;
    
    //,classifiers: moDB.model('classifiers', classifiers)
    
    //classifColl.getClassifiers;
    
    //res.toTemplates.title = 'diff-classif';
    
    //classifiers.methods.getClassifiers = function(conditions, projection, options, callback) {
    
    //res.status(200);
    //res.render('layouts/search-results-kod', res.toTemplates);
};

/*
    let retJSON = {
        ok: 1,
        html: null,
        docsLength: 0
    };

    res.render('partials/list-annnot-docs', {
        layout: null,
        docs: collAttrDocs},
    (err, html) => {

        if(err)
            return res.json(500, {'error': err.message});

        retJSON.html = html;


        moModels.docs.count({}, (err, count) => {

            if(err)
                return res.json(500, {'error': err.message});


            retJSON.docsLength = count;

            res.json(retJSON);
            res.end();

        });

    });
 */