'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const i18n = require('i18n');
const async = require('async');
const dateFormat = require('dateformat');

const HttpError = require(pathRoot +'/libs/http-error');

const xlsx = require('xlsx-populate');

const classifHtml = require(pathRoot +'/libs/classifiers-to-html');

let guidExpRev = '60abb27f-37a8-ca06-03a2-74db071f5a42';

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
    
    res.toTemplates.hideTopMenu = true;
    res.toTemplates.title = i18n.__('Report on the results of3');

    res.toTemplates.itms = [{empty: true}];

    let expertReview = null;
    
    res.toTemplates.exportExcel = '?export=excel';
    
    res.toTemplates.urlFilter = 'reports-type-3-filter';

    if(filterid)
        cacheIdList = req.session.searchKodCache[filterid];

    //if(q.c)
    //    res.toTemplates.exportExcel += '&c='+ q.c;
    
    
    let ntNd = null;
    let ntGuid = null;
    
    if(q.idnt) {

        let arrIdnt = q.idnt.split(',');

        ntNd = arrIdnt[0];
        ntGuid = arrIdnt[1];

        res.toTemplates.exportExcel += '&idnt='+ q.idnt;
    }

    let titleTh = [{
        name: i18n.__('#p/p'),
        css: 'num-puk',
        idx: true,
        row: null
    },{
        name: i18n.__('Requirements'),
        guid: null,
        css: 'require-ments',
        isPid: true,
        row: null
    }];

    let potrebDocs = [];
    let hashTableClassif = null;
    
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
            
            if(ntNd)
                condF.nd = ntNd;
            
            if(cacheIdList) {

                condF = cacheIdList.condF || condF;

                res.toTemplates.exportExcel += '&filterid='+ filterid;
            }

            moModels.docs.find(condF, null, {sort: '-createdAt'}, (err, docs) => {

                if(err)
                    return callback(err);

                if((!docs) || (docs.length < 1))
                    return callback(null, null);

                res.toTemplates.docsCount = docs.length;

                // Непонятно зачем было нужно но без него работает. Скорее всего имеет отношение к фильтру
                /*if(!cacheIdList && !ntNd)
                    return callback(null, null);*/

                callback(null, docs);
            });
        },
        function(docs, callback) {

            if(!docs)
                return callback(null, null);

           callback(null, docs);
        },
        function(docs, callback) {

            req.extReq.getClassifiers( ( err, output ) => {
                if ( err ) return next( err );

                expertReview = output.map((i) => {

                    let ch = {
                        name: i.title ? i.title: i.text,
                        guid: i.guid,
                        row: null,
                        css: 'classif classif-'+ titleTh.length
                    };

                    titleTh.push( ch );
                });

                hashTableClassif = classifHtml.toHashTableClassif(output)[0];

                callback(null, docs);
            });

        },
        function(docs, callback) {

            if(!docs)
                return callback(null, null);
            
            let demCount = 1;

            docs.map(d => {
                
                let attrDoc = moDocs.attToTmpl( d );

                let demands = d.demands;

                let tAr = {
                    idx: potrebDocs.length + 1
                    ,name: attrDoc.name
                    ,nd: attrDoc.nd
                    ,rows: []
                };

                tAr.rows = [
                    {name: tAr.name, css: 'name-of-nd', colspan: titleTh.length}
                ];


                potrebDocs.push(tAr);
                
                let onlyCuId = null;
                
                if(ntGuid)
                    attrDoc.pidsGuids.map((m) => {
                        
                        if(m.guids.indexOf(ntGuid) > -1)
                            onlyCuId = m.id;
                    });

                demands.map(c => {

                    if(onlyCuId)
                        if(!c._id.equals(onlyCuId))
                            return;

                    let demDoc = {
                         css: 'cu-demand'
                        ,rows: []
                    };

                    let cloneTit = titleTh.map((ti, i) => {

                        let v = Object.assign({}, ti);
                            v.row = null;

                        delete v.name;

                        return v;
                    });
                    

                    let text = [];
                    let sliceText = [];

                    c.pidsText.map(t => {

                        text.push( t.text );
                        
                        if(crop < 0)
                            return;
                        
                        let ns = t.text.slice(0, crop);

                        if(ns.length < t.text.length)
                            ns += '...';

                        sliceText.push(ns);
                    });
                    
                    if(sliceText.length < 1)
                        sliceText = text;

                    cloneTit.map(ti => {


                        if(ti.isPid) {

                            if(!ti.row)
                                ti.row = [];

                            ti.text = text;
                            ti.sliceText = sliceText;

                            return;
                        }


                        if(ti.idx) {
                            
                            ti.row = [ demCount++ ];
                            
                            return;
                        }


                        ti.row = ['&mdash;'];

                        c.classif.map(cls => {

                            if(cls.mainguid !== ti.guid)
                                return;
                            
                            ti.row = cls.guids.map(gu => {
                                let ng = hashTableClassif[gu];
                                
                                if(!ng)
                                    return;
                                
                                return ng.name;
                            });
                        });

                    });

                    demDoc.rows = cloneTit;

                    potrebDocs.push(demDoc);
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
                let path = '';
                for( let n in potrebDocs ) {
                    if ( potrebDocs[ n ].nd ) path = `/kdocapi` + await new Promise( ( r, j ) => {
                        req.kdoc.getContentList( potrebDocs[ n ].nd, ( err, result ) => {
                            r( result.data.getContentList[ 0 ].html );
                        });
                    });
                    else {
                        for( let g in potrebDocs[ n ].rows ) {
                            if ( potrebDocs[ n ].rows[ g ].isPid ) potrebDocs[ n ].rows[ g ].row = [ ( await new Promise( ( r, j ) => {
                                let pid = potrebDocs[ n ].rows[ g ].row.join( ',' ); //potrebDocs[ n ].allPid[ p ];
                                let options = {
                                    path: path + `?range=${ pid }`,
                                    host: global.KServerApi.VDirInfo.Hostname,
                                    port: global.KServerApi.VDirInfo.Port,
                                    headers: Object.keys( req.headers ).filter( k => k != 'host' ).reduce( ( o, k ) => { o[ k ] = req.headers[ k ]; return o; }, {})
                                }
                                req.extReq.xhr( ( err, result ) => {
                                    if ( err ) res.send( err );
                                    r( result );
                                }, options );
                            }) )
                                .replace( /<style>[\s\S]*?<\/style>/g, '' )
                                .replace( /<\/p>\n[\s\S]*?<p[\s\S]*?>/g, '\r\n\r\n' )
                                .replace( /\r\n\r\n[\b]*/g, '\r\n\r\n' )
                                .replace( /<\/?[\s\S]*?>/g, '' ).trim() ];
                        }
                    }
                }
                callback(null, docs);
            })();
        }
        
        ,function(docs, callback) {
            if(q.export !== 'excel')
                req.userEvent( 'Report-generation', { comment: i18n.__('Report-generated') + ' "' + i18n.__('Report on the results of3') + '"' } );
            
            /*
             * Для отчётов в Exel
             */
            
            if(q.export !== 'excel')
                return callback(null, docs);


            //potrebDocs.forEach( d => { d.name = d.name.replace( /<br[\s\S]*?>/g, '\n' ).replace( /&quot;/g, '"' ); } );


            let fileName = i18n.__('Report on the results of3');
                fileName = fileName.replace("/", "-");
                fileName += ' ('+ dateFormat(new Date(), "HH.MM dd.mm.yyyy") +')';
            req.userEvent( 'Save-to-file', { comment: i18n.__('File-saved') + ' "' + fileName + '"' } );

            let xlsTable = [
                [
                    i18n.__('#p/p'),
                    i18n.__('Name of ND')
                ].concat( titleTh.filter( ( t, i ) => i ).map( t => t.name ) ),
                [ 1, 2 ].concat( titleTh.filter( ( t, i ) => i ).map( ( t, i ) => i + 3 ) )
            ];
            potrebDocs.forEach( pd => {
                if ( pd.nd ) {
                    xlsTable.push( [ xlsTable.length - 1, pd.name.replace( /<br \/>/g, '\n' ).replace( /&quot;/g, '"' ) ] );
                } else {
                    console.log( 'pd:', pd );
                    xlsTable[ xlsTable.length - 1 ] = xlsTable[ xlsTable.length - 1 ].concat( titleTh.filter( ( t, i ) => i ).map( ( t, i ) => ( pd.rows.filter( g => ( i ? g.guid == t.guid : g.isPid ) )[ 0 ] || { row: [] } )[ i ? 'row' : 'text' ].join( '\r\n' ).replace( '&mdash;', '' ) ) );
                }
            });


            //potrebDocs.forEach( ( p, i ) => xlsTable.push( [ ( i + 1 ), p.name, p.texts ] ) );
            xlsx.fromBlankAsync()
                .then(workbook => {
                    xlsTable[ 1 ].forEach( ( v, ii ) => workbook.sheet("Sheet1").column( "ABCDEFGHIJKLMN"[ ii ] ).width( ii == 1 ? 90 : 30 ).style( "wrapText", true ).style( "verticalAlignment", "top" ));
                    workbook.sheet("Sheet1").row( 1 ).height( 100 ).style( "bold", true ).style( "horizontalAlignment", "center" ).style( "verticalAlignment", "center" );
                    workbook.sheet("Sheet1").row( 2 ).style( "bold", true ).style( "horizontalAlignment", "center" );
                    workbook.sheet("Sheet1").column( "A" ).width(10);
                    let row = 1;
                    let num = 1;
                    xlsTable.forEach( ( arr, i ) => {
                        if ( row < 3 ) arr.forEach( ( v, ii ) => workbook.sheet("Sheet1").cell( ( ii > 26 ? "ABCDEFGHIJKLMNOPQRSTUFVWXYZ"[ parseInt( ii / 27 ) - 1 ] : '' ) + "ABCDEFGHIJKLMNOPQRSTUFVWXYZ"[ ii % 27 ] + ( i + 1 ) ).style( "border", true ).value( v ));
                        else {
                            arr.shift();
                            workbook.sheet("Sheet1").cell( "B" + row ).style( "border", true ).value( arr.shift() );
                            let iters = arr.length / ( xlsTable[ 0 ].length - 2 );
                            for ( let itr = 0; itr < iters + 1; itr++ ) {
                                for ( let subitr = 0; subitr < xlsTable[ 0 ].length; subitr++ ) {
                                    workbook.sheet("Sheet1").cell( ( subitr > 26 ? "ABCDEFGHIJKLMNOPQRSTUFVWXYZ"[ parseInt( subitr / 27 ) - 1 ] : '' ) + "ABCDEFGHIJKLMNOPQRSTUFVWXYZ"[ subitr % 27 ] + row ).style( "border", true );
                                }
                            }
                            row++;
                            for ( let itr = 0; itr < iters; itr++ ) {
                                workbook.sheet("Sheet1").cell( "A" + row ).style( "border", true ).value( num );
                                workbook.sheet("Sheet1").cell( "B" + row ).style( "border", true );
                                num++;
                                for ( let subitr = 2; subitr < xlsTable[ 0 ].length; subitr++ ) {
                                    workbook.sheet("Sheet1").cell( ( subitr > 26 ? "ABCDEFGHIJKLMNOPQRSTUFVWXYZ"[ parseInt( subitr / 27 ) - 1 ] : '' ) + "ABCDEFGHIJKLMNOPQRSTUFVWXYZ"[ subitr % 27 ] + row ).style( "border", true ).value( arr.shift() );
                                }
                                row++;
                            }
                        }
                        row++;
                    });
                    
                    return workbook.outputAsync();
                }).then( data => {
                    res.attachment( fileName + ".xlsx");
                    
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
            //res.toTemplates.docsCount = potrebDocs.length;
        }

        res.toTemplates.titleTh = titleTh;

        res.status(200);
        res.render('layouts/reports/reports-type-3', res.toTemplates);

    });
};