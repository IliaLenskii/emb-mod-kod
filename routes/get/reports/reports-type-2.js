'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');
const dateFormat = require('dateformat');

const xlsx = require('xlsx-populate');

const HttpError = require(pathRoot +'/libs/http-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

module.exports = (req, res, next) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    let moDocs = new moModels.docs;

    let moUsers = new moModels.users;
    
    res.toTemplates.hideTopMenu = true;
    res.toTemplates.title = i18n.__('Report on classified ND / ND projects');

    let q = req.query;
    let filterid = q.filterid;

    let cacheIdList = null;

    if(filterid)
        cacheIdList = req.session.searchKodCache[filterid];
    
    res.toTemplates.itms = [{empty: true}];

    res.toTemplates.exportExcel = '?export=excel';
    
    res.toTemplates.urlFilter = 'reports-type-2-filter';
    
    let guidExpRev = '60abb27f-37a8-ca06-03a2-74db071f5a42';
    let expertReview = null;
    
    let titleTh = [];
    
    let remoteUserList = [];
    let potrebDocs = [];
    
    let arrFunc = [
        function(callback){

            let condF = {
                step: {
                    $elemMatch: {
                        typeStep: 99,
                        stage: 1
                    }
                },
                demands: {
                    $elemMatch: {
                        'classif.mainguid': guidExpRev
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

        },
        function(docs, callback) {

            req.extReq.getClassifiers( ( err, output ) => {
                if ( err ) return next( err );

                expertReview = output.filter((i) => {
                    
                    return i.guid === guidExpRev;
                })[0];


                expertReview.children.map(i => {

                    if((!i) || (!i.guid))
                        return;
                    
                    let ch = {
                        name: i.title ? i.title: i.text,
                        guid: i.guid
                    };

                    titleTh.push( ch );
                });

                callback(null, docs);
            });

        },
        function(docs, callback) {

            if(!docs)
                return callback(null, null);
            
            // remoteUserList - Массив пользователей
            // id под этим номером он сохранён в монге
            // Как в предыдущем отчёте выводим:
            // department
            // login:"KuzmichevVA"
            // name:"Кузьмичев В.А."
            //

            // titleTh - массив требований
            // name - имя
            // guid сравниваем что сохранили в БД и что получили удалённо
            // 

            // docs - подходящий список документов
            //
            //
            //
            
            docs.map(d => {
                
                let attrDoc = moDocs.attToTmpl( d );
                
                // Тут хранится ссылка на пользователя для этого отчёта
                let outUst = d.step[0];
                
                //outUst.executor - ссылка на пользователя id формата монги. Может отсутствовать! Обязательно проверять!!!
                //Это id необходимо сравнивать с элементами массива remoteUserList
                //Так как в этом массиве хранятся полные данные пользователя
                
                //outUst.dateTransfer - дата в отчёт
                
                let demands = d.demands; // Массив с классификаторами
                // В этом массиве необходимо найти все объекты
                // classif у которых mainguid равен 60abb27f-37a8-ca06-03a2-74db071f5a42 (guidExpRev)
                // С этим и работаем

                let user = {};

                if(outUst.executor)
                    remoteUserList.forEach((u) => {
                        
                        if(!outUst.executor._id.equals(u.id))
                            return;
                        
                        user = Object.assign({}, u);

                        user.executorName = user.name ? user.name : user.login;
                    });

                let tAr = {
                    idx: potrebDocs.length + 1,
                    name: attrDoc.name, //имя документа
                    nd: attrDoc.nd,
                    user: user,
                    guides: titleTh.map( tr => {
                        return demands.reduce( ( o, t ) => {
                            o.length += t.classif
                                .filter( cl => cl.mainguid == guidExpRev )
                                .reduce( ( l, cl ) => l + cl.guids.filter( g => g == tr.guid ).length, 0 );
                            return o;
                        }, { length: 0 });
                    }),
                    
                    dateCreate: '' //dateFormat( new Date( outUst.dateTransfer ), "dd.mm.yyyy" )
                };

                if(outUst.dateTransfer)
                    tAr.dateCreate = dateFormat( outUst.dateTransfer, "dd.mm.yyyy" );

                potrebDocs.push(tAr);
            });            

            
            callback(null, docs);
        }
        
        ,function(docs, callback) {
            if(q.export !== 'excel')
                req.userEvent( 'Report-generation', { comment: i18n.__('Report-generated') + ' "' + i18n.__('Report on classificated documents') + '"' } );
            
            /*
             * Для отчётов в Exel
             */
            
            if(q.export !== 'excel')
                return callback(null, docs);

            /* --- !!!!! --- */
            //return callback(null, docs);
            potrebDocs.forEach( d => { d.name = d.name.replace( /<br[\s\S]*?>/g, '\r\n' ).replace( /&quot;/g, '"' ); } );

            let fileName = i18n.__('Report on classificated documents');
                fileName = fileName.replace("/", "-");
                fileName += ' ('+ dateFormat(new Date(), "HH.MM dd.mm.yyyy") +')';
            req.userEvent( 'Save-to-file', { comment: i18n.__('File-saved') + ' "' + fileName + '"' } );

            let xlsTable = [
                [
                    i18n.__('#p/p'),
                    i18n.__('Name of ND'),
                    i18n.__('Expert'),
                    i18n.__('Current date')
                ].concat( titleTh.map( t => t.name ) ),
                [ 1, 2, 3, 4 ].concat( titleTh.map( ( t, i ) => 6 + i ) )
            ];
            
            potrebDocs.forEach( ( p, i ) => {

                let exName = p.user.executorName;

                if(p.user.department)
                    exName += "\r\n"+ p.user.department;
                
                let bn = [
                    ( i + 1 ),
                    p.name,
                    exName,
                    p.dateCreate
                ].concat( p.guides.map( g => g.length ) ) ;
                
                xlsTable.push(bn);
            });

            xlsx.fromBlankAsync()
                .then(workbook => {
                    //[ "B", "C", "D", "E" ].forEach( c => workbook.sheet("Sheet1").column( c ).width(60) );
                    //workbook.sheet("Sheet1").column( "A" ).style( "verticalAlignment", "top" );
                    //workbook.sheet("Sheet1").column( "B" ).style( "verticalAlignment", "top" ).width( 60 ).style( "wrapText", true );
                    //workbook.sheet("Sheet1").column( "C" ).width( 200 ).style( "verticalAlignment", "top" ).style( "wrapText", true );
                    xlsTable[ 1 ].forEach( ( v, ii ) => workbook.sheet("Sheet1").column( "ABCDEFGHIJKLMN"[ ii ] ).width( ii == 1 ? 90 : 30 ).style( "wrapText", true ).style( "verticalAlignment", "top" ));
                    workbook.sheet("Sheet1").column( "A" ).width(10);
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

        let url = `/${ global.KServerApi.Route }/reports/type-3`;

        potrebDocs.forEach(
            d => {
                d.guides = d.guides.map(
                    ( g, i ) => { return { length: g.length
                        ? `<a href="${ url + '?idnt=' + d.nd + ',' + titleTh[ i ].guid }" data-xhr-tabs="main-tabs">${ g.length }</a>`
                        : '0' }; }
                );
            }
        );


        if(potrebDocs.length > 0) {

            res.toTemplates.itms = potrebDocs;
            res.toTemplates.docsCount = potrebDocs.length;
        }
        
        //Возможно временно
        res.toTemplates.titleTh = titleTh;


        res.status(200);
        res.render('layouts/reports/reports-type-2', res.toTemplates);

    });
};