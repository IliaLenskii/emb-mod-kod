'use strict';

const
    userConf = require( './../config' ),
    userConfSite = userConf[ 'site' ],
    http = require( 'http' ),
    https = require( 'https' ),
    i18n = require( 'i18n' ),
    
    classifHtml = require( __dirname +'/classifiers-to-html' ),
    HttpError = require(__dirname +'/http-error'),

    pluginRoute = global.KServerApi.Route,
    
    // Функции очистки строки от слешей по краям: '/my/string/' => 'my/string'
    delSlash = s => s == '/' ? '' : s,
    delSlashes = str => delSlash( ( str || '' ).substr( 0, 1 ) ) + ( str || '' ).slice( 1, -1 ) + delSlash( ( str || '' ).substr( -1 ) );

// Таймеры для отслеживания окончания сессии:
setInterval( () => {
    Object.keys( global.sessTimers ).forEach( sess => {
        global.sessTimers[ sess ].time -= 1000;
        if ( global.sessTimers[ sess ].time < 0 ) {
            global.sessTimers[ sess ].event( 'User-action', { comment: i18n.__('Session-stop') } );
            delete global.sessTimers[ sess ];
        }
    });
}, 1000 );

process.env[ 'NODE_TLS_REJECT_UNAUTHORIZED' ] = '0';

module.exports = ( req, res, next ) => {
    /**
     * Before
     */

    /**
     * В req.userLicenses лицензии из license.json, в base-use.js прогоняем их через проверку,
     * получаем свойство req.userLicenses[ i ].access.granted = true/false
     */
    req.userLicenses = userConf[ 'license' ];
    // Проверка лицензии по имени (напр. req.checkAccess( 'admin' ) = true; -> т.е. req.userLicenses[ 'admin' ].access.granted = true; )
    function getLicenseNameFromNd( nd ) {
        return ( Object.keys( req.userLicenses ).filter( l => req.userLicenses[ l ].nd == nd ) || [] )[ 0 ] || '';
    }
    req.checkAccess = licenseName => (
        ( req.userLicenses[ typeof licenseName == 'string' ? licenseName : getLicenseNameFromNd( licenseName ) ] || {} ).access || {}
    ).granted;
    req.priorityAccess = () => ( Object.keys( req.userLicenses )
        .filter( l => req.userLicenses[ l ].priority )
        .sort( ( a, b ) => req.userLicenses[ a ].priority - req.userLicenses[ b ].priority )
        .filter( l => req.checkAccess( l ) ) || [] )[ 0 ];

    /**
     * Конфигурации текущего запроса
     */
    req.requestOptions = userConfSite[ 'routes' ][ delSlashes( req.url.replace( '/'+ pluginRoute, '' ) ) ] || {};

    req.toUL = classifHtml.toUL;
    req.toULInForm = classifHtml.toULInForm;
    req.toULInFormNoEdit = classifHtml.toULInFormNoEdit;
    
    req.toHashTableClassif = classifHtml.toHashTableClassif;

    /**
     * Внешние запросы
     */
    req.extReq = {};
    let
        dataSerialize = obj => Object.keys( obj ).map( k => k + '=' + obj[ k ] ).join( '&' ),
        without = ( obj, keys ) => Object.keys( obj ).filter( k => !~keys.indexOf( k ) ).reduce( ( o, k ) => { o[ k ] = obj[ k ]; return o; }, {} ),
        assign = objs => objs.reduce( ( o, it ) => {
            Object.keys( it ).forEach( k => o[ k ] = typeof it[ k ] != 'object' ? it[ k ] : assign( [ o[ k ] || {}, it[ k ] ] ) );
            return o;
        }, {} ),
        isHttp = ( options ) => (
            global.kwServers.remarksSubsystem.protocol && global.kwServers.remarksSubsystem.protocol == 'http' && global.kwServers.remarksSubsystem.host == options.host
        ),
        getHttpModule = ( options ) => global.KServerApi.VDirInfo.Protocol != 'https' || isHttp( options ) ? http : https;
    let xhr = function( callback, userConf = {}, name ) {
        if ( userConf.reqData ) userConf.reqData = dataSerialize( userConf.reqData );
        let headers = assign( [ userConf.kdoc ? req.headers : {}, userConf.method == 'POST' && userConf.reqData ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength( userConf.reqData ) } : {} ] );
        let options = assign( [ { headers: headers }, userConfSite[ 'requests' ][ name ] || {}, userConf || {} ] );
        if ( userConf.method != 'POST' && options.reqData ) options.path += '?' + options.reqData;
        if ( userConf.kdoc ) options = userConf;
        let httpReq = ( getHttpModule( options ) ).request( options, function( httpRes ) {
            let output = '';

            if ( httpRes.statusCode >= 400 ) {

                let stEr = i18n.__('The hook.js library (extReq)...');
                    stEr += ' ('+ httpRes.statusCode +')';
                    stEr += '. URL: '+ options.host +''+ options.path;

                let errObk = new HttpError(httpRes.statusCode, stEr);

                return callback( errObk );
            }
    
            httpRes.on( 'data', function ( chunk ) {
                output += chunk;
            });
            httpRes.on( 'end', () => {
                try {
                    try {
                        if ( !options.resDataType || options.resDataType == 'json' ) output = JSON.parse( output );
                    } catch( ee ) {}
                    callback( null, output );
                } catch( err ) {
                    callback( err );
                }
            });
        });
        httpReq.on( 'error', ( err ) => {
            callback( err );
        });
        if ( userConf.method == 'POST' && userConf.reqData ) httpReq.write( userConf.reqData );
        httpReq.end();
    }
    Object.keys( userConfSite[ 'requests' ] ).forEach( r => {
        userConfSite[ 'requests' ][ r ].host = userConfSite[ 'requests' ][ r ].host.replace( '%remarksSubsystem%', global.kwServers.remarksSubsystem.host );
        req.extReq[ r ] = ( callback, options ) => xhr( callback, options, r );
    });
    req.extReq.xhr = xhr;
    
    /**
     * KDoc API
     */
    req.kdoc = {};
    [ 'getIndexes', 'parts', 'getContentList', 'document', 'list', 'log' ].forEach( c => {
        req.kdoc[ c ] = function( data, callback ) {
            if ( typeof data == 'number' ) data = { params: { uuid: data } };
            let vdr = delSlashes( global.KServerApi.VDirInfo.PreferredVDir );
            let defaultFields = () => {
                switch( c ) {
                    case 'log': return [ 'hash', 'email', 'date', 'comment' ];
                    case 'getIndexes': return [ 'key', 'pid', 'title', 'type', 'level' ];
                    case 'parts': return [ 'path', 'pids', 'index' ];
                    case 'getContentList': return [ 'code', 'kxml', 'odt', 'html' ];
                    default: return [ 'uuid', 'path' ];
                }
            }
            let paramsNames = () => {
                switch( c ) {
                    case 'list': return [];
                    case 'parts':
                    case 'getIndexes': return [ 'uuid', 'contentName' ];
                    default: return [ 'uuid' ];
                }
            }
            let paramsVal = p => {
                switch( p ) {
                    case 'uuid': return `-!${ vdr }!-.-!${ data.params.uuid }!-`;
                    case 'contentName': return data.contentName || 'text';
                }
            }
            let pars = () => {
                return paramsNames()
                    .map( p => `${ p }: "${ paramsVal( p ) }"` )
                    .join( ', ' );
            }
            let path = `/kdocapi/graphql?query={ ${ c }(${ pars() }) { ${ ( data.fields || defaultFields() ).join( ', ' ) } } }`
                .replace( / /g, '+' ).replace( /{/g, '%7B' ).replace( /}/g, '%7D' );
            let options = {
                kdoc: true,
                path: path,
                host: global.KServerApi.VDirInfo.Hostname,
                port: global.KServerApi.VDirInfo.Port,
                headers: Object.assign( req.headers, {
                    Accept: 'application/json, text/plain, */*'
                })
            }
            return req.extReq.xhr( callback, options );
        }
    });

    /**
     * В req.userEvents берем конфиги из user-events.json
     */
    req.userEvents = userConf[ 'userEvents' ];
    req.promissedUserEvents = [];
    req.userEvent = ( eventName, data, promissed ) => {
        data = data || {};

        req.pg.query( `SELECT * FROM actions WHERE action='${ eventName }'`, ( err, result ) => {
            // Объект события, который будем сохранять:
            let saveUE = Object.assign({
                action_date: 'now',
                action_object_id: ( ( req.session || {} ).userInfo || {} ).id,
                action_object_title: ( ( req.session || {} ).userInfo || {} ).login,
                resource: req.userEvents[ eventName ].type || 'user',
                user_id: ( ( req.session || {} ).userInfo || {} ).id,
                username: ( ( req.session || {} ).userInfo || {} ).login,
                ip: req.headers[ 'x-kodeks-monitor-remote-addr' ],
                action_id: !err ? ( result.rows[ 0 ] || {} ).id : 0,
                comment: '',
                session_id: req.sessionID,
                save: function() {
                    let
                        keys = Object.keys( this ).filter( k => k != 'save' && k != 'action_object_title' && k != 'resource' ),
                        selectActObj = `SELECT * FROM action_objects WHERE object_id='${ this.action_object_id }' AND resource='${ this.resource }'`,
                        insertActObj = `INSERT INTO action_objects (resource, object_id, title)
                            VALUES ('${ this.resource }', ${ this.action_object_id }, '${ this.action_object_title }') RETURNING id`;

                    req.pg.query( selectActObj, ( err_ao, result_ao ) => {
                        if ( err_ao ) return console.log( 'SQL not execute', `INSERT INTO actions_log (${ keys.join( ', ' ) })
                            VALUES (${ keys.map( k => typeof this[ k ] != 'number' ? "'" + this[ k ] + "'" : this[ k ] ) })` );
                        if ( !result_ao.rows.length )
                            req.pg.query( insertActObj, ( err_iao, result_iao ) => {
                                if ( err_iao ) return console.log( 'SQL not execute', `INSERT INTO actions_log (${ keys.join( ', ' ) })
                                    VALUES (${ keys.map( k => typeof this[ k ] != 'number' ? "'" + this[ k ] + "'" : this[ k ] ) })` );
                                this.action_object_id = result_iao.rows[ 0 ].id;
                                req.pg.query( `INSERT INTO actions_log (${ keys.join( ', ' ) })
                                    VALUES (${ keys.map( k => typeof this[ k ] != 'number' ? "'" + this[ k ] + "'" : this[ k ] ) })`, ( err_al, result_al ) => {});
                            });
                        else {
                            this.action_object_id = result_ao.rows[ 0 ].id;
                            req.pg.query( `INSERT INTO actions_log (${ keys.join( ', ' ) })
                                VALUES (${ keys.map( k => typeof this[ k ] != 'number' ? "'" + this[ k ] + "'" : this[ k ] ) })`, ( err_al, result_al ) => {});
                        }
                    });
                }
            }, data );

            if ( err ) {
                let
                    keys = Object.keys( this ).filter( k => k != 'save' && k != 'action_object_title' && k != 'resource' );
                return console.log( 'SQL not execute', `INSERT INTO actions_log (${ keys.join( ', ' ) })
                    VALUES (${ keys.map( k => typeof this[ k ] != 'number' ? "'" + this[ k ] + "'" : this[ k ] ) })` );
            }

            // promissed - если сохраняем событие не сразу, а в конце выполнения запроса
            if ( promissed ) req.promissedUserEvents.push( saveUE );
            else saveUE.save();
        });
    };
    req.userEvent.eventFilter = ( event, callback ) => {
        req.pg.query( `SELECT id FROM actions WHERE action='${ event }'`, ( err, result ) => {
            if ( err ) callback( err );
            else callback( null, req.promissedUserEvents.filter( ev => ev.action_id == result.rows[ 0 ].id ) );
        });
    }

    /**
     * Определяем событие, соответствующее данному запросу и сохраняем его:
     */
    req.userActions = () => {
        Object.keys( req.userEvents ).forEach( event => {
            // Перебираем req.userEvents в поисках события:
            if ( req.userEvents[ event ].link === undefined ) return;
            if ( ( req.userEvents[ event ].method || 'GET' ).toLowerCase() != req.method.toLowerCase() ) return;
            if ( delSlashes( req.userEvents[ event ].link ) != delSlashes( req.url.replace( '/'+ pluginRoute, '' ) ) ) return;
            // Сохраняем
            req.userEvent( event, null, true );
        });
    }

    if ( !global.sessTimers[ req.sessionID ] )
        global.sessTimers[ req.sessionID ] = { time: userConfSite['sessionTimeout'], event: req.userEvent, noEvent: true };

    // ---------------------------------------------- (ಠ_ಠ) ------------------------------------------------------

    /**
     * After
     */

    function afterResponse() {
        res.removeListener( 'finish', afterResponse );
        res.removeListener( 'close', afterResponse );

        if ( ( req.promissedUserEvents || [] ).length ) {
            req.promissedUserEvents.forEach( ue => ue.save() );
        }

        //req.pg.end();
    }
    res.on( 'finish', afterResponse );
    res.on( 'close', afterResponse );

    function errorReq( e ) {
        console.log( 'Request error: ', e );
    }
    res.on( 'error', errorReq );
    req.on( 'error', errorReq );
    
    next();
}