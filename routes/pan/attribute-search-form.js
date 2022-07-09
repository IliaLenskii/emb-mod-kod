'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;

const i18n = require('i18n');
const fs = require('fs');
const async = require('async');
const url = require('url');
const crypto = require('crypto');

const util = require('util');

const log = require(pathRoot + '/libs/winston-init')(module);

const soapClient = require(pathRoot + '/libs/soap-client');

module.exports = (req, res) => {
    let mongoUsrID = req.session.mongoUsrID;
    let moModels = req.mongooseModels;
    let buf = crypto.randomBytes(8).toString('hex');

    let postData = req.query;

    (async function () {
        let eDocs = (await moModels.docs.find()).map(d => d.nd);
        let client = await soapClient(req);
        //if ( req.query.transneftId == -1 ) req.query.transneftId = ( await client.GetSearchAreasAsync( null ) )[ 0 ].Areas.item_Area[ 1 ].id.$value;
        req.query.transneftId = (global.transneftAttrSearchForm || {}).id || -1;
        let getFormElem = (n) => global.transneftAttrSearchForm.form.filter(e => e.id.$value == n)[0];
        let params = Object.keys(req.query)
            .filter(k => req.query[k])
            .filter(k => k.split('_')[0] == 'id' && k.split('_')[2] == 'type')
            .reduce((o, k) => {
                let par = k.split('_'), id = par[1], type = par[3];
                if (!o[id]) o[id] = {type: type, id: id};
                o[id][par[4]] = req.query[k];
                return o;
            }, {});
        req.userEvent('Search-event', {
            comment: i18n.__('Attribute-search') + ' '
                + Object.keys(params)
                    .filter(k => params[k].value || params[k].values)
                    .map(f => getFormElem(f).name.$value + ': ' + (params[f].value || params[f].values)).join(', ')
        });

        let search = await client.AttrSearchAsync({
            arg0: client.getConditions(),
            arg1: null,
            arg2: req.query.transneftId
        }, {
            //proxy: 'http://localhost:' + global.KServerApi.VDirInfo.localPort,
            timeout: 120000,
            postProcess: xml => {
                return xml
                    .replace(`<arg0>`, `<arg0 xsi:type="tns:ArrayOfanyType">`)
                    .replace(/(<\/?)SOAP-ENC:/g, `$1`)
                //.replace(`<tns:anyType>`, `<tns:anyType xsi:type="SOAP-ENC:Struct">`)
            }
        });
        let total = search[0].DocListInfo.size.$value;
        let arrLs = [];
        let onlyAdmin = req.checkAccess('admin');
        for (let i = 0; i < search[0].DocListInfo.parts.$value; i++) {
            let arrLs2 = search[0].DocListInfo.size.$value == 0
                ? []
                : (await client.GetSearchListAsync({
                    'arg0': search[0].DocListInfo.id.$value,
                    'arg1': null,
                    'arg2': i,
                    arg3: null,
                    arg4: 'abc'
                }, {
                    useEmptyTag: true, postProcess: xml => {
                        xml = xml.replace('<arg1>', '<arg1 xsi:nil="true">');
                        return xml;
                    }, timeout: 120000 /*, proxy: 'http://localhost:' + global.KServerApi.VDirInfo.localPort*/
                }))
                    [0].ArrayOfDocListItem.item_DocListItem.map(r => {
                    return {
                        name: r.name.$value + (r.info.$value
                            ? ('<br><div style="font-style: italic; font-size: 13px; color: #b9b9b9; line-height: 15px; width: 400px;">' + r.info.$value + '</div>')
                            : ''),
                        nd: (r.nd || {}).$value,
                        onlyAdmin: onlyAdmin,
                        noindb: !~eDocs.indexOf((r.nd || {}).$value * 1),
                        emptyText: !(r.haskdoc || {}).$value
                    };
                });
            arrLs = [].concat(arrLs, arrLs2);
        }
        if (arrLs.length > total) arrLs = arrLs.reduce((o, d) => {
            if (o.filter(nd => nd.nd == d.nd).length == 0) o.push(d);
            return o;
        }, []);
        for (let d in arrLs) {

            if (!arrLs[d].nd) {

                arrLs[d].isErr = true;

                continue;
            }

            if (arrLs[d].emptyText)
                arrLs[d].onlyAdmin = false;
        }

        arrLs = arrLs.filter(d => !d.isErr);

        let retObj = {
            docs: arrLs,
            docsCount: total, //arrLs.length,
            //'typeSearch': typeSearch,
            ok: true
        };

        req.session.searchKodCache[buf] = retObj;

        let retJSON = {
            pan: 1,
            ok: 1,
            listid: buf,
            docsCount: total
        };

        res.json(retJSON);

    })();

};