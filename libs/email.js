'use strict';

const i18n = require( 'i18n' );

module.exports = async function( obj ) {
    function mailSettings() {
        switch ( obj.type ) {
            case 'Add-docs-analisys': return [ i18n.__( 'Add docs analisys mail' ), i18n.__( 'Add docs analisys mail body', obj.docs.map( d => d.tooltip ).join( "\", \"" ) ) ];
            case 'Transfer-on-coordination': return [ i18n.__( 'Add docs analisys mail' ), i18n.__( 'Add docs analisys mail body', obj.docs.tooltip ) ];
            case 'Classification-coordination': return [ i18n.__( 'Add docs analisys mail' ), i18n.__( 'Add docs analisys mail body', obj.docs.tooltip ) ];
        }
    }
    async function send( user ) {
        return await global.KServerApi.SendMail( user.email, ...mailSettings() );
    }
    for ( let n in obj.users ) {
        await send( obj.users[ n ] );
    }
}