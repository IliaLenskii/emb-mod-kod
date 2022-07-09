'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');

const HttpError = require(pathRoot +'/libs/http-error');

const userConf = require( pathRoot +'/config' );
const editClassifierConf = userConf[ 'site' ][ 'editClassifierAuth' ];

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

module.exports = ( req, res, next ) => {
    let mongoUsrID = req.session.mongoUsrID;
    let query = req.query;

    editClassifierConf.url = editClassifierConf.url.replace( '%remarksSubsystem%', global.kwServers.remarksSubsystem.host );

    let
        sc = new Buffer( editClassifierConf.system_code ).toString( 'base64' ),
        sk = new Buffer( editClassifierConf.system_key ).toString( 'base64' ),
        ui = new Buffer( req.session.userInfo.login ).toString( 'base64' ),
        ur = new Buffer( req.priorityAccess() ).toString( 'base64' );

    res.toTemplates.eScript = `
    <script>
        var data = { system_code:'${ sc }',system_key:'${ sk }',user_id:'${ ui }',user_role:'${ ur }' };
        $.ajax({
            url: '${ ( global.kwServers.remarksSubsystem.protocol || KsApi.VDirInfo.Protocol ) + '://' + editClassifierConf.url }',
            dataType: 'JSONP',
            jsonpCallback: 'callback',
            type: 'POST',
            data: data,
            success: function (data) {
                console.log(data);
                jQuery('.fir-ifr').attr('src',data.url);
            }
        });
    </script>`;
    res.status(200);
    res.render('layouts/edit-classifier', res.toTemplates);
};
