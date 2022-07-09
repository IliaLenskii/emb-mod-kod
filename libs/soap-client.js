'use strict';

const soap = require('soap');
let url = '';

/**
 * Kodweb API
 */
module.exports = function( req ) {
    //url = `${ global.KServerApi.VDirInfo.Protocol }://${ global.KServerApi.VDirInfo.Host }${ global.KServerApi.VDirInfo.PreferredVDir }/api?wsdl&use=literal`;

    return ( async function() {
        // Создание клиента и настройки
        //url = `http://localhost:${ global.KServerApi.VDirInfo.localPort }${ global.KServerApi.VDirInfo.PreferredVDir }/api?wsdl&use=literal`;
        url = `http://localhost:${ global.KServerApi.VDirInfo.Port }${ global.KServerApi.VDirInfo.PreferredVDir }/api?wsdl&use=literal`;
        let headers = Object.keys( req.headers ).filter( h => h != 'host' ).reduce( ( o, h ) => { o[ h ] = req.headers[ h ]; return o; }, {} );
        let client = await soap.createClientAsync( url, {
            wsdl_headers: headers,
            //proxy: 'http://localhost:' + global.KServerApi.VDirInfo.localPort,
            attributesKey: '$attributes'
        });
        //Object.keys( req.headers ).filter( h => h != 'host' ).forEach( h => client.addHttpHeader( h, req.headers[ h ] ) );
        Object.keys( headers ).forEach( h => client.addHttpHeader( h, headers[ h ] ) );

        // Метод для оборачивания параметров запроса в формат soap в .AttrSearch()
        // последовательность выполнения функций снизу вверх
        client.getConditions = function() {
            let
                // Преобразование значения параметра в soap
                getVal = ( k, param, type ) => {
                    switch( k ) {
                        case 'values': return param.split( ',' ).map( i => {
                                return {
                                    $attributes: getAttrs( 'item' + type ),
                                    $value: i
                                }
                            });
                        case 'lop': return param.toLowerCase();
                        default: return param;
                    }
                },
                // Добавление параметру поля $attributes
                getAttrs = ( k, type ) => {
                    switch( k ) {
                        case 'values': return { xsi_type: { prefix: "SOAP-ENC", type: "Array", xmlns: "http://schemas.xmlsoap.org/soap/encoding/" } };
                        case 'mode':
                        case 'id': return { xsi_type: { prefix: "xsd", type: "int", xmlns: "http://www.w3.org/2001/XMLSchema" } };
                        default: return { xsi_type: { prefix: "xsd", type: "string", xmlns: "http://www.w3.org/2001/XMLSchema" } };
                    }
                },
                // Конвертируем параметр (объект) в soap-представление
                condition = ( k, param ) => {
                    return Object.assign(
                        { $attributes: { xsi_type: { prefix: "SOAP-ENC", type: "Struct", xmlns: "http://schemas.xmlsoap.org/soap/encoding/" } } },
                        Object.keys( param ).filter( p => p != 'type' ).reduce( ( o, k ) => {
                            o[ k ] = {
                                $attributes: getAttrs( k ),
                                [ k == 'values' ? 'item' : '$value' ]: getVal( k, param[ k ], param.type )
                            }
                            return o;
                        }, {})
                    );
                },

                // Параметры запроса req.query (вида "id_0_type_2_value") парсятся и собираются в объект params
                params = Object.keys( req.query )
                    .filter( k => req.query[ k ] )
                    .filter( k => k.split( '_' )[ 0 ] == 'id' && k.split( '_' )[ 2 ] == 'type' )
                    .reduce( ( o, k ) => {
                        let par = k.split( '_' ), id = par[ 1 ], type = par[ 3 ];
                        if ( !o[ id ] ) o[ id ] = { type: type, id: id };
                        o[ id ][ par[ 4 ] ] = req.query[ k ];
                        return o;
                    }, {} );

            return {
                anyType: Object.keys( params ).filter( k => params[ k ].value || params[ k ].values ).map( f => condition( f, params[ f ] ) )
            };
            
        }

        return client;
    })();
}