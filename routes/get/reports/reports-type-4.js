'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');
const dateFormat = require('dateformat');

const url = require('url');

const xlsx = require('xlsx-populate');

const HttpError = require(pathRoot +'/libs/http-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

module.exports = (req, res, next) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    let moDocs = new moModels.docs;

    let moUsers = new moModels.users;
    
    let cacheIdList = null;

    let q = req.query;
    let filterid = q.filterid;
    let crop = q.c ? parseInt(q.c, 10) : 99;

    if(filterid)
        cacheIdList = req.session.searchKodCache[filterid];


    res.toTemplates.hideTopMenu = true;
    res.toTemplates.title = i18n.__('Summary report on requirements');
    
    res.toTemplates.itms = [{empty: true}];
    
    res.toTemplates.exportExcel = '?export=excel';

    res.toTemplates.urlFilter = 'reports-type-4-filter';

    if(q.c)
        res.toTemplates.exportExcel += '&c='+ q.c;

    let arrCoGuids = null;

    let potrebDocs = [];
    
    let arrFunc = [
        function(callback){

            let condF = {

                step: {
                    $elemMatch: {
                        typeStep: 99,
                        stage: 1
                    }
                }
            };
            
            if(cacheIdList) {

                condF = cacheIdList.condF || condF;
                arrCoGuids = cacheIdList.arrCoGuids;

                res.toTemplates.exportExcel += '&filterid='+ filterid;
            }
            

            moModels.docs.find(condF, null, {sort: '-createdAt'}, (err, docs) => {

                if(err)
                    return callback(err);

                if((!docs) || (docs.length < 1))
                    return callback(null, null);

                callback(null, docs);
            });
        }
        ,function(docs, callback) {

            if(!docs)
                return callback(null, null);

            docs.map(d => {

                let attrDoc = moDocs.attToTmpl( d );

                let tAr = {
                     idx: potrebDocs.length + 1
                    ,name: attrDoc.name
                    ,nd: attrDoc.nd
                    ,allPid: attrDoc.allPid
                    ,text: []
                    ,sliceText: []
                };


                attrDoc.pidsGuids.map(itm => {
                    
                    if(arrCoGuids) {

                        let fi = itm.guids.filter(g => {

                            return arrCoGuids.indexOf(g) > -1;
                        });

                        if(fi.length < 1)
                            return;
                    }

                    itm.pidsText.map((t, i, cuarr) => {


                        tAr.text.push( t.text );


                        if(i === 0) {

                            tAr.sliceText.push({
                                id: itm.id,
                                partText: t.text,
                                last: cuarr.length < 2,
                                info: t.info
                            });
                        }
                    });

                });

                potrebDocs.push(tAr);
            });

           callback(null, docs);
        }
        ,function(docs, callback) {

            if(potrebDocs.length < 1)
                return callback(null, null);
            
            if(q.export)
                return callback(null, docs);

            potrebDocs.map(d => {

                if(crop < 0)
                    return;
                
                d.sliceText.forEach((itm, i) => {

                    if(!itm)
                        return;
                    
                    let pt = itm.partText;
                    var info = itm.info || {};
                    
                    if(itm.last && pt.length < 200) {

                        if(info.img)
                            return;

                        d.sliceText[i].id = null;
                        return;
                    }

                    let ptSlice = pt.slice(0, crop);
                    
                    if(ptSlice.length < pt.length)
                        ptSlice += '...';
                   
                    d.sliceText[i].partText = ptSlice;
                });
            });

            callback(null, docs);
        }
        ,function(docs, callback) {
            
            callback(null, docs);
            return;
            
            /*
             * Нужно
             * Не удалять
             **/
            
            ( async function() {
                for( let n in potrebDocs ) {
                    let path = `/kdocapi` + await new Promise( ( r, j ) => {
                        req.kdoc.getContentList( potrebDocs[ n ].nd, ( err, result ) => {
                            r( result.data.getContentList[ 0 ].html );
                        });
                    });
                    potrebDocs[ n ].texts = await new Promise( ( r, j ) => {
                        let pid = potrebDocs[ n ].allPid.join( ',' ); //potrebDocs[ n ].allPid[ p ];
                        let options = {
                            path: path + `?range=${ pid }`,
                            host: global.KServerApi.VDirInfo.Hostname,
                            port: global.KServerApi.VDirInfo.Port,
                            headers: req.headers
                        }
                        req.extReq.xhr( ( err, result ) => {
                            if ( err ) res.send( err );
                            r( result );
                        }, options );
                    });
                    potrebDocs[ n ].texts = potrebDocs[ n ].texts
                            .replace( /<style>[\s\S]*?<\/style>/g, '' )
                            .replace( /<\/p>\n[\s\S]*?<p[\s\S]*?>/g, '\r\n\r\n' )
                            .replace( /\r\n\r\n[\b]*/g, '\r\n\r\n' )
                            .replace( /<\/?[\s\S]*?>/g, '' ).trim();
                }
                callback(null, docs);
            })();
        }
        ,function(docs, callback) {
            if(q.export !== 'excel')
                req.userEvent( 'Report-generation', { comment: i18n.__('Report-generated') + ' "' + i18n.__('Summary report on requirements') + '"' } );

            if(q.export !== 'excel')
                return callback(null, docs);

            potrebDocs.forEach( d => { d.name = d.name.replace( /<br[\s\S]*?>/g, '\n' ).replace( /&quot;/g, '"' ); } );

            let fileName = i18n.__('Summary report on requirements');
                fileName = fileName.replace("/", "-");
                fileName += ' ('+ dateFormat(new Date(), "HH.MM dd.mm.yyyy") +')';
            req.userEvent( 'Save-to-file', { comment: i18n.__('File-saved') + ' "' + fileName + '"' } );

            let xlsTable = [
                [
                    i18n.__('#p/p'),
                    i18n.__('Name of ND'),
                    i18n.__('Requirements')
                ],
                [ 1, 2, 3 ]
            ];


            potrebDocs.forEach( ( p, i ) => xlsTable.push( [ ( i + 1 ), p.name, p.text.join('\n\n') ] ) );

            xlsx.fromBlankAsync()
                .then(workbook => {
                    //[ "B", "C", "D", "E" ].forEach( c => workbook.sheet("Sheet1").column( c ).width(60) );
                    workbook.sheet("Sheet1").column( "A" ).style( "verticalAlignment", "top" );
                    workbook.sheet("Sheet1").column( "B" ).style( "verticalAlignment", "top" ).width( 60 ).style( "wrapText", true );
                    workbook.sheet("Sheet1").column( "C" ).width( 200 ).style( "verticalAlignment", "top" ).style( "wrapText", true );
                    workbook.sheet("Sheet1").row( 1 ).height( 100 ).style( "bold", true ).style( "horizontalAlignment", "center" ).style( "verticalAlignment", "center" );
                    workbook.sheet("Sheet1").row( 2 ).style( "bold", true ).style( "horizontalAlignment", "center" );
                    workbook.sheet("Sheet1").column( "A" ).width(10);
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
            return next(err);

        if(potrebDocs.length > 0) {

            res.toTemplates.itms = potrebDocs;
            res.toTemplates.docsCount = potrebDocs.length;
        }


        res.status(200);
        res.render('layouts/reports/reports-type-4', res.toTemplates);

    });
};