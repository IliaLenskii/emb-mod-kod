'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const express = require('express');
const router = express.Router();

const i18n = require('i18n');
const fs = require('fs');
const async = require('async');
const url = require('url');

const util = require('util');

const HttpError = require(pathRoot +'/libs/http-error');
const AccessError = require(pathRoot +'/libs/access-error');
const log = require(pathRoot +'/libs/winston-init')(module);
const getUserAgent = require(pathRoot +'/libs/user-agent');
const otherFunc = require(pathRoot +'/libs/other');
const kodProd = require(pathRoot +'/config/kodeks-product');

const lic = require(pathRoot +'/config/lic');


router.use(function(req, res, next){

    //highlightLink
    let licenses = ( Object.keys( req.userLicenses ) || [] )
        .filter( l => req.userLicenses[ l ].priority && ( req.userLicenses[ l ] || {} ).nd );


    res.toTemplates = {
        title: null
        ,userAgentName: null
        ,userAgentVersion: null
        ,hideTopMenu: false
        ,xhr: req.xhr
        ,originalUrl: req.originalUrl
        ,VDirInfo: {}
        ,version: KsApi.Info.version
        ,userName: null
        ,login: null
        ,errorColorTriangle: '#106BAD'
    };
    
    /**
     * Добавляем в res.toTemplates св-во access (объект), ключи - имена лицензий,
     * значения - геттеры, дергающие функцию req.checkAccess
     * (примерно так: res.toTemplates.access = { admin: true, expert: false } )
     * т.о. в шаблонизаторе проверяем их через {{#if (access/admin)}}
     */
    res.toTemplates.access = licenses
        // Перебираем массив с именами лицензий...
        .reduce( ( o, l ) => {
            // ...и собираем из них объект с геттерами вида { get admin: () => req.checkAccess( 'admin' ) }
            Object.defineProperty( o, l, {
                get: () => req.checkAccess( l )
            });
            return o;
        }, {} );


    if(req.xhr)
        res.toTemplates['layout'] = null;


    var currUA = req.header('user-agent');

    var userAgent = getUserAgent(currUA) || {};

    if(userAgent.name && userAgent.version) {

        res.toTemplates.userAgentName = userAgent.name;
        res.toTemplates.userAgentVersion = parseInt(userAgent.version, 10);
    }

    /*
     * Для корректной работы по AJAX, необходимо выключить кэширование
     */

    res.setHeader("Cache-control", "no-store");

    /*
     * Объект для хранения результатов поиска документы для классификации
    */
    if(!req.session.hasOwnProperty('searchKodCache'))
        req.session.searchKodCache = {};

    next();
});

router.use(function(req, res, next) {

    var bra = res.toTemplates['userAgentName'];
    var verBra = res.toTemplates['userAgentVersion'];

    var isRender = (
        (bra == 'ie' && verBra < 11)      ||
        (bra == 'safari' && verBra < 8)  ||
        (bra == 'opera' && verBra < 40)  ||
        (bra == 'firefox' && verBra < 40) ||
        (bra == 'chrome' && verBra < 20)
    );


    if(bra == 'chrome' && verBra < 50)
        res.toTemplates['chromeOld'] = true;
    

    if(isRender) {

        res.toTemplates.title = i18n.__('Your browser is out of date');

        res.toTemplates.errorTitle = i18n.__('Your browser is out of date');
        res.toTemplates.errorDescription = i18n.__('Update your browser to display this site correctly');

        res.toTemplates.errorColorTriangle = '#555555';
        
        return next(new AccessError(403, i18n.__('Your browser is out of date')));
    }

    next();
});

router.use(function(req, res, next){

    var accLang = req.header('Accept-Language');

    //app.use(i18n.init);
    //res.setLocale('de');

    // ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4

    next();
});

/*
 * Объединение js в один файл main.js
 */
router.use((req, res, next) => {

    if(pluginProduction || req.xhr) {

        return next();
    }
    
    /*
     * 
     * Для режима разработки js файлов
     */
    
    let toWriteJS = pathRoot +'/public/js/main.js';

    let arrFunc = [(callback) => {

        fs.open(toWriteJS, 'r', (err, fd) => {

            if(err)
                return callback(err);

            fs.close(fd, (err) => {

                if(err)
                    return callback(err);

                callback(null, true);
            });

        });
    }, (isfile, callback) => {

        if(!isfile)
            return callback(new Error('File not exists: '+ toWriteJS));
        
        let allJS = [
            pathRoot +'/public/js/sources/'
        ];

        let rredJs = [];

        allJS.forEach((itemPath, i) => {

            let fileItem = fs.readdirSync(itemPath);

            if((!fileItem) || (fileItem.length < 1))
                return;

            var ffrd = fileItem.reduce((prevArr, currItem) => {
                let prt = itemPath + currItem;
                let getStatF = fs.statSync(prt);

                if((!getStatF) || (!getStatF.isFile()))
                    return prevArr;

                prevArr.push(prt);

                return prevArr;
            }, []);

            ffrd.sort();

            rredJs = rredJs.concat(ffrd);
        });

        callback(null, rredJs);
        
    }, (files, callback) => {

        fs.truncate(toWriteJS, 0, (err) => {

            if(err)
                return callback(err);

            callback(null, files);
        });
    }, (files, callback) => {

        let writeStream = fs.createWriteStream(toWriteJS);

        async.concatSeries(files, fs.readFile, (err, filedatas) => {

            async.eachSeries(filedatas, (data, callback) => {

                writeStream.write(data, callback);

            }, (err) => {

                if(err)
                    return callback(err);

                callback(null, true);
            });
        });
        
    }];

    async.waterfall(arrFunc, (err, result) => {
        
        if(err)
            return next(new Error(err));
        
        next();
    });

});

router.use((req, res, next) => {

    if(!req.moDB) {

        throw new Error('The Mongoose did not connect');

        return;
    }

    next();
});

/*
 * Собирает относящуюся к KServer'у информацию о запросе и
 * помещает её в свойство KServer объекта request (IncomingMessage)
 */

router.use((req, res, next) => {

    if(pickKServerInfo)
        pickKServerInfo(req);

    next();
});


router.use((req, res, next) => {
    
    let notVT = i18n.__('Could not find directory for interaction');

    if(!KsApi.hasOwnProperty('VDirInfo'))
        otherFunc.GetServerInfo(null, (err, result) => {

            if(err)
                return next(err);

            //isPreferredVDirUnknown

            if(!result)
                return next(new Error(notVT));

            let preferredVDir = result.PreferredVDir;

            if((!preferredVDir) || (preferredVDir === ''))
                return next(new Error(notVT));

            KsApi.VDirInfo = result;

            next();
        });
    else
        next();
});

router.use( async (req, res, next) => {
    let PreferredVDir = KsApi.VDirInfo.PreferredVDir;
    
    /*
    if(PreferredVDir.indexOf('/') != 0)
        PreferredVDir = '/'+ PreferredVDir;
    
    */
    if(PreferredVDir.lastIndexOf('/') != (PreferredVDir.length - 1))
        PreferredVDir = PreferredVDir +'/';
    
    res.toTemplates.VDirInfo = KsApi.VDirInfo;
    //let client = await soapClient( req );
    //let areas = await client.GetSearchAreasAsync( null ).catch( err => { next(); } );
    //let transneftId = -1; //areas[ 0 ].Areas.item_Area[ 1 ].id.$value;
    res.toTemplates.transneftId = -1; //transneftId;
    res.toTemplates.formAction = '/classification/attribute-search-form'; //PreferredVDir +'classification';
    
    next();
});

/*
 * Для работы плагина необходим продукт Транснефти
 */

router.use((req, res, next) => {

    let missProd = i18n.__('Missing required product') +': '+ kodProd.name +' ('+ kodProd.code +')';
    
    KsApi.KodeksProductStatus(kodProd.code, req).then((result) => {
        //let result = '{"name":"Отраслевые НД ПАО «Транснефть» в БД ИСУНД АСУТП","plugged":true}';
        
        let prodJson = {};

        if(util.isString(result)) {

            try {

                prodJson = JSON.parse(result);
            } catch(caerr){}
        }

        if(!prodJson.plugged) {

            return next(new Error(missProd));
        }

        next();

    }).catch((err) => {

        next(new Error(err));
    });

});

/*
 * Обработчику resolve (в случае успеха) передается объект с информацией о пользователе:
 */

router.use((req, res, next) => {

    let moModels = req.mongooseModels;

    if((!KsApi.UserInfo) || (!req.KServer)) {

        return next(new AccessError(401));
    }
    
    if(!req.KServer.session) {

        return next(new AccessError(401));
    }
    
    /*
     * Будет желание, перепиши эту хуйню
     */

    KsApi.UserInfo(req.KServer.session).then((userinfo) => {
        let uinf = userinfo;
        let jsonUInf = {};

        if(util.isString(uinf)) {

            try {

                jsonUInf = JSON.parse(uinf);
            } catch(caerr){}
        }

        if(!jsonUInf.authenticated) {

            return next(new AccessError(401));
        }
        
        let loginToLower = String(jsonUInf.login).toLowerCase();

        req.session.userInfo = jsonUInf;
        
        res.toTemplates.userName = jsonUInf.name ? jsonUInf.name : jsonUInf.login;
        res.toTemplates.login = jsonUInf.login;

        let licenses = ( Object.keys( req.userLicenses ) || [] )
            .filter( l => req.userLicenses[ l ].priority && ( req.userLicenses[ l ] || {} ).nd );
        let licenseOk = false;

        // Асинхронная проверка лицензий:
        async.parallel(
            /**
             * Перебираем массив с именами лицензий, получаем массив функций:
             * [ function( callback ) { KsApi.CheckAccess(...)}, function( callback ) { KsApi.CheckAccess(...)}, ... ]
             * результаты проверки каждой сохраняем в req.userLicenses[ i ].access
             */
            licenses.map(
                l => {
                    return function( callback ) {
                        KsApi.CheckAccess( req.userLicenses[ l ].nd, req).then(
                            access => {
                                req.userLicenses[ l ].access = JSON.parse( access );
                                if ( req.userLicenses[ l ].access.granted ) licenseOk = true;
                                callback( null, access );
                            },
                            err => {
                                req.userLicenses[ l ].access = { granted: false, error: err };
                                callback( err );
                            }
                        );
                    }
                }
            ), ( licenseErr, result ) => {
                moModels.users.findOne({login: loginToLower }, ( reqErr, usr ) => {
            
                    if( licenseErr || reqErr ) {
    
                        return next(new Error( licenseErr || reqErr ));
                    }
                    
                    if( !licenseOk && !req.requestOptions.freeAccess ) {

                        return next(new AccessError( 403, i18n.__('Active license not exists') ) );
                    }
    
                    if((!usr) || (usr.length < 1)) {
    
                        let nnUsr = new moModels.users({
                             login: loginToLower
                             ,nd: jsonUInf.id
                        });
    
                        nnUsr.save((err, rV) => {
    
                            if(err) {
    
                                return next(new Error(err));
                            }
    
                            req.session.mongoUsrID = rV.id;
    
                            next();
                        });
    
                    } else {
                        
                        req.session.mongoUsrID = usr.id;
    
                        next();
                    }

                    if ( global.sessTimers[ req.sessionID ].noEvent ) {
                        req.userEvent( 'User-action', { comment: i18n.__('Session-start') } );
                        global.sessTimers[ req.sessionID ].noEvent = false;
                    }
    
                });
                req.userActions();
            }
        );

    })
    .catch((err) => {

        next(new Error(err));
    });

});

router.use( ( req, res, next ) => {
    if ( !global.transneftAttrSearchForm ) ( async function() {
        const soapClient = require( pathRoot + '/libs/soap-client' );
        let client = await soapClient( req );
        let areas = await client.GetSearchAreasAsync( null /*, { proxy: 'http://localhost:' + global.KServerApi.VDirInfo.localPort }*/ ).catch( e => { console.log( 'K.W.A. e:', e ); } );
        //console.log( 'K.W.A. areas:', areas );
        let transneftId = ( areas[ 0 ] || areas ).Areas.item_Area[ 1 ].id.$value;
        let formElems = ( areas[ 0 ] || areas ).Areas.item_Area[ 1 ].attrs.item_SearchAttribute;
        for( let i in formElems ) {
            if ( formElems[ i ].type.$value == 5 )
                formElems[ i ].classifiers = ( await client.GetClassificatorsAsync( { arg0: formElems[ i ].id.$value + '', arg1: transneftId }/*, { proxy: 'http://localhost:' + global.KServerApi.VDirInfo.localPort }*/ ) )
                    [ 0 ].Classificators.list.item_Classificator.filter( cf => !cf.hasChildren.$value );
        }

        global.transneftAttrSearchForm = {
            id: transneftId,
            form: formElems
        }
    })();

    next();
});

/*
router.use((req, res, next) => {
    let limitedAccess = lic.limitedAccess;
    let urlParts = url.parse(req.url);
    let pathname = urlParts.pathname;

    if(urlParts.pathname === '/')
        return next();

    pathname = pathname.replace(/\/{1,}$/, '');
    
    let heIs = limitedAccess[pathname];

    if(!heIs)
        return next();

    if(heIs.methods.indexOf(req.method) < 0)
        return next();
    
    let gr = heIs.groups;
    let access = res.toTemplates.access || {};
    
    for(let i = 0; i < gr.length; i++) {
        let grItm = gr[i];
        
        if(!access.hasOwnProperty(grItm))
            continue;
        
        if(access[grItm] === false)
            return next(new AccessError( 403, i18n.__('Active license not exists') ) );
    }

    next();
});
*/

module.exports = router;