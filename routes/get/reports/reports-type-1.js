'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');
const dateFormat = require('dateformat');

const HttpError = require(pathRoot +'/libs/http-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

const xlsx = require('xlsx-populate');

module.exports = (req, res, next) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    let moDocs = new moModels.docs;

    let moUsers = new moModels.users;
    
    let q = req.query;
    let filterid = q.filterid;

    let cacheIdList = null;

    if(filterid)
        cacheIdList = req.session.searchKodCache[filterid];

    res.toTemplates.hideTopMenu = true;
    res.toTemplates.title = i18n.__('Report on the stages of classification1');
    
    res.toTemplates.itms = [{empty: true}];

    res.toTemplates.exportExcel = '?export=excel';

    res.toTemplates.urlFilter = 'reports-type-1-filter';

    
    let remoteUserList = [];
    let potrebDocs = [];

    let arrFunc = [
        function(callback){

            let condF = {

                step: {
                    $elemMatch: {
                        executor: {$ne: null}
                    }
                }
            };

            if(cacheIdList) {

                condF = cacheIdList.condF || condF;

                res.toTemplates.exportExcel += '&filterid='+ filterid;
            }

            moModels.docs.find(condF, null, {sort: '-createdAt'}).populate('step.executor').exec((err, docs) => {

                if(err)
                    return callback(err);

                if((!docs) || (docs.length < 1))
                    return callback(null, null);

                callback(null, docs);
            });
        },
        function(docs, callback) {
            
            if(!docs)
                return callback(null, null);
            
            moUsers.usersInfoMoAndRemot(req, (err, result) => {
                
                if(err) return next(err);

                remoteUserList = result;

                callback(null, docs);
            });

        }
        ,function(docs, callback) {

            if(!docs)
                return callback(null, null);

            docs.map(d => {
                
                let attrDoc = moDocs.attToTmpl( d );
                
                let tAr = {
                    idx: potrebDocs.length + 1,
                    name: attrDoc.name,
                    currTypeStep: attrDoc.currTypeStep,
                    currTypeName: attrDoc.currTypeName,
                    step: []
                };


                attrDoc.step.forEach(s => {
                    
                    let stag = {
                        executorName: '',
                        department: ''
                    };
                    
                    if(s.executor)
                    for(let usr = 0; usr < remoteUserList.length; usr++) {
                        let itmUsr = remoteUserList[usr];
                        
                        if((!itmUsr) || (!itmUsr.id))
                            continue;
                        
                        if(!ObjectID(itmUsr.id).equals(s.executor))
                            continue;

                        stag.executorName = itmUsr.name ? itmUsr.name : itmUsr.login;
                        stag.department = itmUsr.department;
                        
                        break;
                    }

                    tAr.step.push(stag);
                });
                
                potrebDocs.push(tAr);
            });

           callback(null, docs);
        }
        ,function(docs, callback) {
            if(q.export !== 'excel')
                req.userEvent( 'Report-generation', { comment: i18n.__('Report-generated') + ' "' + i18n.__('Report on the stages of classification1') + '"' } );

            if(q.export !== 'excel')
                return callback(null, docs);

            potrebDocs.forEach( d => { d.name = d.name.replace( /<br[\s\S]*?>/g, '\r\n' ).replace( /&quot;/g, '"' ); } );

            let fileName = i18n.__('Report on the stages of classification1');
                fileName = fileName.replace("/", "-");
                fileName += ' ('+ dateFormat(new Date(), "HH.MM dd.mm.yyyy") +')';
            req.userEvent( 'Save-to-file', { comment: i18n.__('File-saved') + ' "' + fileName + '"' } );

            let xlsTable = [
                [
                    i18n.__('#p/p'),
                    i18n.__('Name of ND'),
                    i18n.__('Expert for defining requirements and classification', ''),
                    i18n.__('Expert for harmonizing the classification', ''),
                    i18n.__('Classification stage')
                ],
                [ 1, 2, 3, 4, 5 ]
            ];
            potrebDocs.forEach( ( p, i ) => xlsTable.push( [ ( i + 1 ), p.name, p.step[ 0 ].executorName, p.step[ 1 ].executorName, p.currTypeName ] ) );
            xlsx.fromBlankAsync()
                .then(workbook => {
                    workbook.sheet("Sheet1").column( "B" ).style( "wrapText", true );
                    [ "B", "C", "D", "E" ].forEach( c => workbook.sheet("Sheet1").column( c ).width(60) );
                    workbook.sheet("Sheet1").row( 1 ).height( 100 ).style( "bold", true ).style( "horizontalAlignment", "center" ).style( "verticalAlignment", "center" );
                    workbook.sheet("Sheet1").row( 2 ).style( "bold", true ).style( "horizontalAlignment", "center" );
                    xlsTable.forEach( ( arr, i ) => {
                        arr.forEach( ( v, ii ) => workbook.sheet("Sheet1").cell( "ABCDEFGHIJKLMN"[ ii ] + ( i + 1 ) ).style( "border", true ).value( v ));
                    });
                    
                    return workbook.outputAsync();
                }).then( data => {
                    res.attachment( fileName +".xlsx");
                    
                    res.send( data );
                })
                .catch(next);

        }
    ];


    async.waterfall(arrFunc, (err, result) => {

        if(err)
            return next(new HttpError(500, err.message));


        if(potrebDocs.length > 0) {

            res.toTemplates.itms = potrebDocs;
            res.toTemplates.docsCount = potrebDocs.length;
        }


        res.status(200);
        res.render('layouts/reports/reports-type-1', res.toTemplates);

    });
};