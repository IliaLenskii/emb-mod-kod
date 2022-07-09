'use strict';

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

const soapClient = require( pathRoot + '/libs/soap-client' );

module.exports = (req, res) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    let moDocs = new moModels.docs;
    
    let query = req.query;
    let listid = query['listid'];
    let cacheIdList = null;
    
    res.toTemplates.hideTopMenu = false;
    res.toTemplates.title = i18n.__('Find the ND in the ISUND ASUTP');
 

    if(listid) {

        cacheIdList = req.session.searchKodCache[listid];
    } else {
        
        res.toTemplates.showSearchDialog = true;

        ( async function() {
            let transneftId = ( global.transneftAttrSearchForm || {} ).id;
            let formElems = ( global.transneftAttrSearchForm || {} ).form;

            if ( !global.transneftAttrSearchForm ) {
                let client = await soapClient( req );
                let areas = await client.GetSearchAreasAsync( null, /*{ proxy: 'http://localhost:' + global.KServerApi.VDirInfo.Port }*/ );
                transneftId = areas[ 0 ].Areas.item_Area[ 1 ].id.$value;
                formElems = areas[ 0 ].Areas.item_Area[ 1 ].attrs.item_SearchAttribute;
                for( let i in formElems ) {
                    if ( formElems[ i ].type.$value == 5 )
                        formElems[ i ].classifiers = ( await client.GetClassificatorsAsync( { arg0: formElems[ i ].id.$value + '', arg1: transneftId }, { proxy: 'http://localhost:' + global.KServerApi.VDirInfo.localPort } ) )
                            [ 0 ].Classificators.list.item_Classificator.filter( cf => !cf.hasChildren.$value );
                }
                global.transneftAttrSearchForm = {
                    id: transneftId,
                    form: formElems
                }
            }

            res.toTemplates.formElems = formElems;
            res.toTemplates.transneftId = transneftId;
            res.render('layouts/pan/attribute-search', res.toTemplates);
        })();

        return;
    }

    if(!cacheIdList) {
        
        res.toTemplates.searchError = i18n.__('Could not find document list cache');

        res.render('layouts/pan/attribute-search', res.toTemplates);
        return;
    }
 


    res.toTemplates.searchQuery = cacheIdList.query;
    res.toTemplates.docsCount = cacheIdList.docsCount;
    res.toTemplates.listid = listid;
    

    if(cacheIdList.error) {

        res.toTemplates.searchError = cacheIdList.error;

        res.render('layouts/pan/attribute-search', res.toTemplates);
        return;
    }
    
    
    let arrJSDocs = [].concat( (cacheIdList.docs || []) );
    
    if(arrJSDocs.length < 1) {
        
        res.toTemplates.searchError = i18n.__('The result returned an empty list of documents');

        res.render('layouts/pan/attribute-search', res.toTemplates);
        return;
    }
    

    /*
     * Если документ уже в БД Монго, то параметр не передавать,
     *  так он выводит в шаблон способ ссылку позволяющую это сделать
     * 
     */
    /*arrJSDocs.map((itm) => {
        
        itm['noindb'] = true; // Если дока нет в БД
        
        return itm;
    });*/


    res.toTemplates.docs = arrJSDocs;
    
    res.render('layouts/pan/attribute-search', res.toTemplates);
};
