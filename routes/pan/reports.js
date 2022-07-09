'use strict';

let KsApi = global.KServerApi || {};

//const express = require('express');
//const router = express.Router();

const pathRoot = KsApi.RootPath;
const pluginProduction = KsApi.pluginProduction;
//const request = require('request');

const log = require(pathRoot +'/libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');
const dateFormat = require('dateformat');

const HttpError = require(pathRoot +'/libs/http-error');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

const soapClient = require( pathRoot + '/libs/soap-client' );
const xlsx = require('xlsx-populate');
const util = require('util');
const classifHtml = require(pathRoot +'/libs/classifiers-to-html');


module.exports = (req, res, next) => {
    let moModels = req.mongooseModels;
    let moDocs = new moModels.docs;



    //( async function() {
    // коннект к кодвебу
    let query = req.query;
    let listND = query.nd;
    let nd = '';
    if (util.isArray(listND)) {
        nd = String(listND[0]);
        for (let i in listND) {
            if ((!listND[i]) || (listND[i] < 9))
                return next(new HttpError(404, i18n.__('Invalid number document')));
        }
    } else {
        listND = [String(query.nd)];
        nd = String(query.nd);
    }

    let showreport = query.showreport;

    if ((!nd) || (nd.length < 9))
        return next(new HttpError(404, i18n.__('Invalid number document')));


    let dataSerialize = obj => Object.keys(obj).map(k => k + '=' + obj[k]).join(';');

    let fullArrDocs = [];


    async.waterfall([
        (callback) => {
            moDocs.getMuchKodeksDocInfo(listND, req, (err, docInfo) => {
                if (err)
                    return next(err);

                fullArrDocs = docInfo;
                callback(null, fullArrDocs);
            });
        }
    ], (err, result) => {

        fullArrDocs[0].name = String(fullArrDocs[0].name).replace(/\r/g, '');
        fullArrDocs[0].name = fullArrDocs[0].name.replace(/\n{2,}/g, "\n");
        fullArrDocs[0].name = fullArrDocs[0].name.replace(/\n/g, "");
        fullArrDocs[0].name = fullArrDocs[0].name.replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"')
        if (fullArrDocs.length == 1) {
            res.toTemplates.title = fullArrDocs[0].name;
        }


        let reports = String(query.reports);

        // отмененные НД
        if (reports == 'disablednd')
            req.extReq.analytics((err, output) => {
                if (err) return next(err);
                //let arrLinks = output.map(a => a.links);
                let actLinks = 0; //output.filter(a => a.links.filter(b => b.actingStatus == 'active'));
                let disLinks = 0; //output.filter(a => a.links.filter(b => b.actingStatus == 'notactive'));
                let report = [];
                let linksInSection = [];
                for (let i in output) {
                    let itm = output[i];
                    let links = itm.links;
                    linksInSection[i] = [];
                    for (let j in links) {
                        let link = links[j];

                        if (link.nd == nd) continue;

                        linksInSection[i][link.nd] = (!linksInSection[i][link.nd]) ? 1 : linksInSection[i][link.nd] + 1;

                        if (link.actingStatus == 'active' && !link.noExists) {
                            if (linksInSection[i][link.nd] == 1) {
                                actLinks++;
                            }
                            continue;
                        }

                        let name = link.name;
                        if (!name) {
                            name = "Ссылочный документ отсутствует в БФ ИСУНД АСУТП";
                            if (link.text) name += " (" + link.text + ")";
                        }
                        let replacedBy = link.replacedBy;
                        let replacedByND = "";
                        let replacedByName = "";
                        if (replacedBy) {
                            replacedByND = link.replacedBy[0].nd;
                            replacedByName = link.replacedBy[0].name;
                        }
                        if (linksInSection[i][link.nd] == 1) {
                            report.push({
                                title: itm.title,
                                nd: link.nd,
                                replacedByNd: replacedByND,
                                replacedByName: replacedByName,
                                name: name,
                                link: res.toTemplates.VDirInfo.PreferredVDir,
                                count: 0,
                                nameN: i,
                                text: link.text
                                //status: link.actingStatus,
                            });
                            disLinks++;
                        }
                    }
                }

                for (let i in report) {
                    report[i].count = linksInSection[report[i].nameN][report[i].nd];
                }

                if (showreport == 'true') {
                    res.toTemplates.actLinks = actLinks;
                    res.toTemplates.disLinks = disLinks;
                    res.toTemplates.itms = report;
                    res.toTemplates.docsCount = disLinks;
                    res.toTemplates.exportExcel = "?nd=" + listND.join("&nd=") + "&reports=" + reports + "&showreport=excel";
                    res.status(200);
                    res.render('layouts/pan/reports/report-disablednd', res.toTemplates);
                    return;
                }

                if (showreport == 'excel') {
                    report.forEach(d => {
                        d.title = d.title.replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"');
                    });

                    let fileName = i18n.__('Report on the links to cancelled NDs');
                    fileName = fileName.replace("/", "-");
                    fileName += ' (' + dateFormat(new Date(), "HH.MM dd.mm.yyyy") + ')';
                    req.userEvent('Save-to-file', {comment: i18n.__('File-saved') + ' "' + fileName + '"'});

                    let xlsTable = [
                        [i18n.__('Report on the links to cancelled NDs')],
                        [fullArrDocs[0].name],
                        [
                            i18n.__('#p/p'),
                            i18n.__('Section'),
                            i18n.__('Cancelled ND'),
                            i18n.__('Replacing ND')
                        ],
                        [1, 2, 3, 4]
                    ];

                    report.forEach((d, i) => {
                        let bn = [
                            (i + 1),
                            d.title,
                            d.name,
                            d.replacedByName,
                        ];

                        xlsTable.push(bn);
                    });

                    xlsx.fromBlankAsync()
                        .then(workbook => {
                            xlsTable[3].forEach((v, ii) => workbook.sheet("Sheet1").column("ABCDEFGHIJKLMN"[ii]).width(ii == 1 ? 30 : 90).style("wrapText", true).style("verticalAlignment", "top"));
                            workbook.sheet("Sheet1").column("A").width(10);
                            workbook.sheet("Sheet1").range("A1", "D1").merged(true);
                            workbook.sheet("Sheet1").range("A2", "D2").merged(true);
                            for (let r = 0; r <= 4; r++) {
                                workbook.sheet("Sheet1").row(r).height(-1).style({
                                    "horizontalAlignment": "center",
                                    "fill": 'f2f2f2',
                                    "border": true
                                });
                            }
                            //workbook.sheet("Sheet1").autoFilter(workbook.sheet("Sheet1").range("A2","C2"));
                            xlsTable.forEach((arr, i) => {
                                workbook.sheet("Sheet1").row(i+1).height(-1).style({fontSize: 9});
                                arr.forEach((v, ii) => workbook.sheet("Sheet1").cell("ABCDEFGHIJKLMN"[ii] + (i + 1)).style("border", true).value(v));
                            });
                            return workbook.outputAsync();
                        }).then(data => {
                        res.attachment(fileName + ".xlsx");

                        res.send(data);
                    })
                        .catch(next);

                    return;
                }
                let json = {actLinks: actLinks, disLinks: disLinks, report: report, nd: nd};
                res.json(json);
            }, {
                host: res.toTemplates.VDirInfo.Hostname,
                port: res.toTemplates.VDirInfo.Port,
                path: res.toTemplates.VDirInfo.PreferredVDir + "/text_field/links",
                reqData: {nd: nd},
                headers: {'Cookie': dataSerialize(req.cookies)}
            });

        // отмененные НД
        if (reports == 'normative')
            req.extReq.analytics((err, output) => {
                if (err) return next(err);
                //let arrLinks = output.map(a => a.links);
                let normLinks = output.filter(a => (a.title.indexOf('Нормативные') > -1 || a.title.indexOf('Библиография') > -1)); //.map(a => a.links); // массив объектов со ссылками в нормативных документах
                let arrNormLinks = [];
                for (let i in normLinks) {
                    let link = normLinks[i].links;
                    for (let j in link)
                        arrNormLinks.push(link[j].nd);
                }
                //let actLinks = 0; //output.filter(a => a.links.filter(b => b.actingStatus == 'active'));
                let countLinks = 0; //output.filter(a => a.links.filter(b => b.actingStatus == 'notactive'));
                let report = [];
                // теперь пройдем по всему ответу и поищем ссылки которые отсутствуют в нормативных
                for (let i in output) {
                    let itm = output[i];
                    if (itm.title.indexOf('Нормативные') > -1) continue;
                    if (itm.title.indexOf('Библиография') > -1) continue;
                    if (itm.title.indexOf('Предисловие') > -1) continue;
                    // в каждом разделе текста дублирующиеся ссылки не показываем, только одну
                    let razdelArr = [];
                    let links = itm.links;
                    for (let j in links) {
                        let link = links[j];
                        if (arrNormLinks.indexOf(link.nd) > -1) continue; // пропускаем ссылки которые есть в нормативке
                        if (razdelArr.indexOf(link.nd) > -1) continue; // пропускаем дублирующиеся ссылки
                        if (link.nd == nd) continue; // пропускаем ссылки на самого себя
                        let name = link.name;
                        if (!name) name = "Ссылочный документ отсутствует в БФ ИСУНД АСУТП";
                        report.push({
                            title: itm.title,
                            nd: link.nd,
                            name: name,
                            link: res.toTemplates.VDirInfo.PreferredVDir
                        });
                        razdelArr.push(link.nd);
                        countLinks++;

                    }
                }
                if (showreport == 'true') {
                    res.toTemplates.inclLinks = countLinks;
                    res.toTemplates.allLinks = countLinks + arrNormLinks.length;
                    res.toTemplates.itms = report;
                    res.toTemplates.docsCount = countLinks;
                    res.toTemplates.exportExcel = "?nd=" + listND.join("&nd=") + "&reports=" + reports + "&showreport=excel";
                    res.status(200);
                    res.render('layouts/pan/reports/report-normative', res.toTemplates);
                    return;
                } else if (showreport == 'excel') {
                    report.forEach(d => {
                        d.title = d.title.replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"');
                    });

                    let fileName = i18n.__('Report on references in the text of the document to other normative documents');
                    fileName = fileName.replace("/", "-");
                    fileName += ' (' + dateFormat(new Date(), "HH.MM dd.mm.yyyy") + ')';
                    req.userEvent('Save-to-file', {comment: i18n.__('File-saved') + ' "' + fileName + '"'});

                    let xlsTable = [
                        [i18n.__('Report on references in the text of the document to other normative documents')],
                        [fullArrDocs[0].name],
                        [
                            i18n.__('#p/p'),
                            i18n.__('Section'),
                            i18n.__('Linked ND title')
                        ],
                        [1, 2, 3]
                    ];

                    report.forEach((d, i) => {
                        let bn = [
                            (i + 1),
                            d.title,
                            d.name
                        ];

                        xlsTable.push(bn);
                    });

                    xlsx.fromBlankAsync()
                        .then(workbook => {
                            xlsTable[3].forEach((v, ii) => workbook.sheet("Sheet1").column("ABCDEFGHIJKLMN"[ii]).width(ii == 1 ? 30 : 90).style("wrapText", true).style("verticalAlignment", "top"));
                            workbook.sheet("Sheet1").column("A").width(10);
                            workbook.sheet("Sheet1").range("A1", "C1").merged(true);
                            workbook.sheet("Sheet1").range("A2", "C2").merged(true);
                            for (let r = 0; r <= 4; r++) {
                                workbook.sheet("Sheet1").row(r).height(-1).style({
                                    "horizontalAlignment": "center",
                                    "fill": 'f2f2f2',
                                    "border": true
                                });
                            }
                            //workbook.sheet("Sheet1").autoFilter(workbook.sheet("Sheet1").range("A2","C2"));
                            xlsTable.forEach((arr, i) => {
                                workbook.sheet("Sheet1").row(i+1).height(-1).style({fontSize: 9});
                                arr.forEach((v, ii) => workbook.sheet("Sheet1").cell("ABCDEFGHIJKLMN"[ii] + (i + 1)).style("border", true).value(v));
                            });
                            return workbook.outputAsync();
                        }).then(data => {
                        res.attachment(fileName + ".xlsx");

                        res.send(data);
                    })
                        .catch(next);

                    return;
                }
                let json = {inclLinks: countLinks, allLinks: countLinks + arrNormLinks.length, report: report, nd: nd};
                res.json(json);
            }, {
                host: res.toTemplates.VDirInfo.Hostname,
                port: res.toTemplates.VDirInfo.Port,
                path: res.toTemplates.VDirInfo.PreferredVDir + "/text_field/links",
                reqData: {nd: nd},
                headers: {'Cookie': dataSerialize(req.cookies)}
            });


        // отмененные НД
        if (reports == 'abbr')
            req.extReq.analytics((err, output) => {
                if (err) return next(err);
                let abbrLinks = output.filter(a => a.title.toLowerCase().indexOf('сокращения') > -1); //.map(a => a.links); // массив объектов со ссылками в нормативных документах
                let arrAbbrLinks = [];
                for (let i in abbrLinks) {
                    let acronyms = abbrLinks[i].acronyms;
                    for (let j in acronyms)
                        arrAbbrLinks.push(acronyms[j]);
                }
                let countAcronyms = 0; //output.filter(a => a.links.filter(b => b.actingStatus == 'notactive'));
                let report = [];
                // теперь пройдем по всему ответу и поищем ссылки которые отсутствуют в нормативных
                for (let i in output) {
                    let itm = output[i];
                    if (itm.title.toLowerCase().indexOf('сокращения') > -1) continue;
                    if (itm.title.indexOf('Предисловие') > -1) continue;
                    let acronyms = itm.acronyms;
                    for (let j in acronyms) {
                        let acronym = acronyms[j];
                        if (arrAbbrLinks.indexOf(acronym) > -1) continue; // пропускаем аббр которые есть в сокращениях
                        report.push({
                            title: itm.title,
                            acronym: acronym,
                        });
                        countAcronyms++;

                    }
                }
                if (showreport == 'true') {
                    res.toTemplates.countAcronyms = countAcronyms;
                    res.toTemplates.itms = report;
                    res.toTemplates.docsCount = countAcronyms;
                    res.toTemplates.exportExcel = "?nd=" + listND.join("&nd=") + "&reports=" + reports + "&showreport=excel";
                    res.status(200);
                    res.render('layouts/pan/reports/report-abbr', res.toTemplates);
                    return;
                } else if (showreport == 'excel') {
                    report.forEach(d => {
                        d.title = d.title.replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"');
                    });

                    let fileName = i18n.__('Report on the list of abbreviations');
                    fileName = fileName.replace("/", "-");
                    fileName += ' (' + dateFormat(new Date(), "HH.MM dd.mm.yyyy") + ')';
                    req.userEvent('Save-to-file', {comment: i18n.__('File-saved') + ' "' + fileName + '"'});

                    let xlsTable = [
                        [i18n.__('Report on the list of abbreviations')],
                        [fullArrDocs[0].name],
                        [
                            i18n.__('#p/p'),
                            i18n.__('Section'),
                            i18n.__('Potential abbreviation')
                        ],
                        [1, 2, 3]
                    ];

                    report.forEach((d, i) => {
                        let bn = [
                            (i + 1),
                            d.title,
                            d.acronym
                        ];

                        xlsTable.push(bn);
                    });

                    xlsx.fromBlankAsync()
                        .then(workbook => {
                            xlsTable[3].forEach((v, ii) => workbook.sheet("Sheet1").column("ABCDEFGHIJKLMN"[ii]).width(ii == 1 ? 90 : 30).style("wrapText", true).style("verticalAlignment", "top"));
                            workbook.sheet("Sheet1").column("A").width(10);
                            workbook.sheet("Sheet1").range("A1", "C1").merged(true);
                            workbook.sheet("Sheet1").range("A2", "C2").merged(true);
                            for (let r = 0; r <= 4; r++) {
                                workbook.sheet("Sheet1").row(r).height(-1).style({
                                    "horizontalAlignment": "center",
                                    "fill": 'f2f2f2',
                                    "border": true
                                });
                            }
                            //workbook.sheet("Sheet1").autoFilter(workbook.sheet("Sheet1").range("A2","C2"));
                            xlsTable.forEach((arr, i) => {
                                workbook.sheet("Sheet1").row(i+1).height(-1).style({fontSize: 9});
                                arr.forEach((v, ii) => workbook.sheet("Sheet1").cell("ABCDEFGHIJKLMN"[ii] + (i + 1)).style("border", true).value(v));
                            });
                            return workbook.outputAsync();
                        }).then(data => {
                        res.attachment(fileName + ".xlsx");

                        res.send(data);
                    })
                        .catch(next);

                    return;
                }
                let json = {countAcronyms: countAcronyms, report: report, nd: nd};
                res.json(json);
            }, {
                host: res.toTemplates.VDirInfo.Hostname,
                port: res.toTemplates.VDirInfo.Port,
                path: res.toTemplates.VDirInfo.PreferredVDir + "/text_field/acronyms",
                reqData: {nd: nd}, // dictionary - словарь терминов Транснефти
                headers: {'Cookie': dataSerialize(req.cookies)}
            });

        if (reports == 'terms')
            req.extReq.analytics((err, output) => {
                if (err) return next(err);

                let report = [];
                let cntTermsNotInDict = 0;
                let cntTermsDiffDict = 0;
                let cntTermsNotInTerms = 0;
                for (let i in output) {
                    let itm = output[i];
                    let definitions = itm.dictionaryDefinitions ? itm.dictionaryDefinitions : [];
                    if (!definitions.length) {
                        cntTermsNotInDict++;
                        report.push({
                            i: i,
                            title: itm.name,
                            definition: itm.definition,
                            dictionaryDefinition: "",
                            sources: [],
                        });
                    }
                    let inDict = false;
                    for (let ii in definitions) {
                        let dd = definitions[ii];
                        let sources = dd.sources ? dd.sources : [];
                        let def = String(dd.text).replace(/\r/g, '');
                        def = def.replace(/\n{2,}/g, "\n");
                        def = def.toLowerCase().replace(itm.name.toLowerCase(), "").trim();
                        if (def.replace(";","").replace(".","") == itm.definition.toLowerCase().replace(";","").replace(".","") )
                            inDict = true;
                        report.push({
                            i: i,
                            title: itm.name,
                            definition: itm.definition,
                            dictionaryDefinition: def,
                            sources: sources.map (s => {
                                return {
                                    name: s.name,
                                    nd: s.nd,
                                    link: res.toTemplates.VDirInfo.PreferredVDir
                                };
                            })
                        });
                    }
                    if (!inDict) {
                        cntTermsDiffDict ++;
                    }
                }
                if (showreport == 'true') {
                    res.toTemplates.itms = report;
                    res.toTemplates.docsCount = output.length;
                    res.toTemplates.exportExcel = "?nd=" + listND.join("&nd=") + "&reports=" + reports + "&showreport=excel";
                    res.status(200);
                    res.render('layouts/pan/reports/report-term', res.toTemplates);
                    return;
                } else if (showreport == 'excel') {
                    report.forEach(d => {
                        d.title = d.title.replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"');
                        d.definition = d.definition.replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"');
                        d.dictionaryDefinition = d.dictionaryDefinition.replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"');
                        d.sources = d.sources.map(s => {
                           return s.name;
                        });
                        d.sources = d.sources.join("\r\n").replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"');
                    });

                    let fileName = i18n.__('Report on terms and definitions');
                    fileName = fileName.replace("/", "-");
                    fileName += ' (' + dateFormat(new Date(), "HH.MM dd.mm.yyyy") + ')';
                    req.userEvent('Save-to-file', {comment: i18n.__('File-saved') + ' "' + fileName + '"'});

                    let xlsTable = [
                        [i18n.__('Report on terms and definitions').replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"')],
                        [fullArrDocs[0].name],
                        [
                            i18n.__('#p/p'),
                            i18n.__('Term name'),
                            i18n.__('Definition'),
                            i18n.__('Definition from dictionary'),
                            i18n.__('Definition source')
                        ],
                        [1, 2, 3, 4, 5]
                    ];

                    report.forEach((d, i) => {
                        let bn = [
                            parseInt(d.i)+1,
                            d.title,
                            d.definition,
                            d.dictionaryDefinition,
                            d.sources,
                        ];

                        xlsTable.push(bn);
                    });

                    xlsx.fromBlankAsync()
                        .then(workbook => {
                            xlsTable[3].forEach((v, ii) => workbook.sheet("Sheet1").column("ABCDEFGHIJKLMN"[ii]).width(ii == 1 ? 30 : 90).style("wrapText", true).style("verticalAlignment", "top"));
                            workbook.sheet("Sheet1").column("A").width(10);
                            workbook.sheet("Sheet1").range("A1", "E1").merged(true);
                            workbook.sheet("Sheet1").range("A2", "E2").merged(true);
                            workbook.sheet("Sheet1").range("A1", "E4").style({
                                "horizontalAlignment": "center",
                                "fill": 'f2f2f2',
                                "border": true
                            });
                            //workbook.sheet("Sheet1").range("A4","E4").autoFilter();
                            xlsTable.forEach((arr, i) => {
                                workbook.sheet("Sheet1").row(i+1).height(-1).style({fontSize: 9});
                                arr.forEach((v, ii) => workbook.sheet("Sheet1").cell("ABCDEFGHIJKLMN"[ii] + (i + 1)).style("border", true).value(v));
                            });
                            return workbook.outputAsync();
                        }).then(data => {
                        res.attachment(fileName + ".xlsx");

                        res.send(data);
                    })
                        .catch(next);

                    return;
                }
                let json = {countTerms: output.length, countTermsNotInDict: cntTermsNotInDict, countTermsDiffDict: cntTermsDiffDict, report: report, nd: nd};
                res.json(json);
            }, {
                host: res.toTemplates.VDirInfo.Hostname,
                port: res.toTemplates.VDirInfo.Port,
                path: res.toTemplates.VDirInfo.PreferredVDir + "/text_field/terms",
                reqData: {nd: nd, dictionary: 440800006}, // dictionary - словарь терминов Транснефти
                headers: {'Cookie': dataSerialize(req.cookies)}
            });

        if (reports == 'abbr-comp')
            req.extReq.analytics((err, output) => {
                if (err) return next(err);

                let report = [];
                let cntTermsNotInDict = 0;
                let cntTermsDiffDict = 0;
                let cntTermsNotInTerms = 0;
                for (let i in output) {
                    let itm = output[i];
                    let definitions = itm.dictionaryDefinitions ? itm.dictionaryDefinitions : [];
                    if (!definitions.length) {
                        cntTermsNotInDict++;
                        report.push({
                            i: i,
                            title: itm.name,
                            definition: itm.definition,
                            dictionaryDefinition: "",
                            sources: [],
                            link: "",
                        });
                    }
                    let inDict = false;
                    for (let ii in definitions) {
                        let dd = definitions[ii];
                        let sources = dd.sources ? dd.sources : [];
                        let def = String(dd.text).replace(/\r/g, '');
                        def = def.replace(/\n{2,}/g, "\n");
                        def = def.replace(/\n/g, "").trim();
                        def = def.toLowerCase().replace(itm.name.toLowerCase(), "").trim();
                        if (def.replace(";","").replace(".","") == itm.definition.toLowerCase().replace(";","").replace(".","") )
                            inDict = true;
                        report.push({
                            i: i,
                            title: itm.name,
                            definition: itm.definition,
                            dictionaryDefinition: def,
                            sources: sources.map (s => {
                                return {
                                    name: s.name,
                                    nd: s.nd,
                                    link: res.toTemplates.VDirInfo.PreferredVDir
                                };
                            }),
                            link: res.toTemplates.VDirInfo.PreferredVDir + '/?nd=' + itm.dictionaryLink
                        });
                    }
                    if (!inDict) {
                        cntTermsDiffDict ++;
                    }
                }
                if (showreport == 'true') {
                    res.toTemplates.itms = report;
                    res.toTemplates.docsCount = output.length;
                    res.toTemplates.exportExcel = "?nd=" + listND.join("&nd=") + "&reports=" + reports + "&showreport=excel";
                    res.status(200);
                    res.render('layouts/pan/reports/report-abbr-comp', res.toTemplates);
                    return;
                } else if (showreport == 'excel') {
                    report.forEach(d => {
                        d.title = d.title.replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"');
                        d.definition = d.definition.replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"');
                        d.dictionaryDefinition = d.dictionaryDefinition.replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"');
                        d.sources = d.sources.map(s => {
                            return s.name;
                        });
                        d.sources = d.sources.join("\r\n").replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"');
                    });

                    let fileName = i18n.__('Report on the list of abbreviations compare').replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"');
                    fileName = fileName.replace("/", "-");
                    fileName += ' (' + dateFormat(new Date(), "HH.MM dd.mm.yyyy") + ')';
                    req.userEvent('Save-to-file', {comment: i18n.__('File-saved') + ' "' + fileName + '"'});

                    let xlsTable = [
                        [i18n.__('Report on the list of abbreviations compare').replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"')],
                        [fullArrDocs[0].name],
                        [
                            i18n.__('#p/p'),
                            i18n.__('Acronym'),
                            i18n.__('Explanation'),
                            i18n.__('Explanation from the terms dictionary'),
                            i18n.__('Source of the term'),
                            i18n.__('Link to the entry')
                        ],
                        [1, 2, 3, 4, 5, 6]
                    ];

                    report.forEach((d, i) => {
                        let bn = [
                            parseInt(d.i)+1,
                            d.title,
                            d.definition,
                            d.dictionaryDefinition,
                            d.sources,
                            d.link,
                        ];

                        xlsTable.push(bn);
                    });

                    xlsx.fromBlankAsync()
                        .then(workbook => {
                            xlsTable[3].forEach((v, ii) => workbook.sheet("Sheet1").column("ABCDEFGHIJKLMN"[ii]).width(ii == 1 ? 30 : 90).style("wrapText", true).style("verticalAlignment", "top"));
                            workbook.sheet("Sheet1").column("A").width(10);
                            workbook.sheet("Sheet1").range("A1", "F1").merged(true);
                            workbook.sheet("Sheet1").range("A2", "F2").merged(true);
                            workbook.sheet("Sheet1").range("A1", "F4").style({
                                "horizontalAlignment": "center",
                                "fill": 'f2f2f2',
                                "border": true
                            });

                            xlsTable.forEach((arr, i) => {
                                workbook.sheet("Sheet1").row(i+1).height(-1).style({fontSize: 9});
                                arr.forEach((v, ii) => workbook.sheet("Sheet1").cell("ABCDEFGHIJKLMN"[ii] + (i + 1)).style("border", true).value(v));
                            });
                            return workbook.outputAsync();
                        }).then(data => {
                        res.attachment(fileName + ".xlsx");

                        res.send(data);
                    })
                        .catch(next);

                    return;
                }
                let json = {countAbbrs: output.length, countTermsNotInDict: cntTermsNotInDict, countTermsDiffDict: cntTermsDiffDict, nd: nd};
                res.json(json);
            }, {
                host: res.toTemplates.VDirInfo.Hostname,
                port: res.toTemplates.VDirInfo.Port,
                path: res.toTemplates.VDirInfo.PreferredVDir + "/text_field/acronyms_definition",
                reqData: {nd: nd, dictionary: 440810005}, // dictionary - словарь терминов Транснефти
                headers: {'Cookie': dataSerialize(req.cookies)}
            });

        if (reports == 'type-1') {
            let moUsers = new moModels.users;

            let q = req.query;
            let filterid = q.filterid;
            let cacheIdList = null;
            if (filterid)
                cacheIdList = req.session.searchKodCache[filterid];

            let remoteUserList = [];
            let potrebDocs = [];
            let completedCnt = 0;
            let notStartedCnt = 0;
            let duringCnt = 0;
            let agreementCnt = 0;

            let arrFunc = [
                function (callback) {
                    let condF = {
                        step: {
                            $elemMatch: {
                                executor: {$ne: null}
                            }
                        }
                    };

                    if (cacheIdList) {

                        condF = cacheIdList.condF || condF;

                        res.toTemplates.exportExcel += '&filterid=' + filterid;
                    }

                    moModels.docs.find({$and: [{nd: {$in: listND}}, condF]}, null, {sort: '-createdAt'}).populate('step.executor').exec((err, docs) => {
                        if (err)
                            return callback(err);

                        if ((!docs) || (docs.length < 1))
                            return callback(null, null);

                        callback(null, docs);
                    });
                },
                function (docs, callback) {


                    if (!docs)
                        return callback(null, null);

                    moUsers.usersInfoMoAndRemot(req, (err, result) => {

                        if (err) return next(err);

                        remoteUserList = result;

                        callback(null, docs);
                    });

                }
                , function (docs, callback) {

                    if (!docs)
                        return callback(null, null);

                    docs.map(d => {

                        let attrDoc = moDocs.attToTmpl(d);

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
                                department: '',
                                org: '',
                                phone: ''
                            };

                            if (s.executor)
                                for (let usr = 0; usr < remoteUserList.length; usr++) {
                                    let itmUsr = remoteUserList[usr];

                                    if ((!itmUsr) || (!itmUsr.id))
                                        continue;

                                    if (!ObjectID(itmUsr.id).equals(s.executor))
                                        continue;

                                    stag.executorName = itmUsr.name ? itmUsr.name : itmUsr.login;
                                    stag.department = itmUsr.department;
                                    stag.org = itmUsr.org;
                                    stag.phone = itmUsr.phone;

                                    break;
                                }

                            tAr.step.push(stag);
                        });

                        switch (tAr.currTypeName) {
                            case i18n.__('Stage-Completed'):
                                completedCnt++;
                                break;
                            case i18n.__('Stage-Not started'):
                                notStartedCnt++;
                                break;
                            case i18n.__('Stage-During'):
                                duringCnt++;
                                break;
                            case i18n.__('On agreement'):
                                agreementCnt++;
                                break;
                        }

                        potrebDocs.push(tAr);
                    });

                    callback(null, docs);
                }
                , function (docs, callback) {

                    if (showreport == 'true') {

                        req.userEvent('Report-generation', {comment: i18n.__('Report-generated') + ' "' + i18n.__('Report on the stages of classification1') + '"'});
                        return callback(null, docs);

                    } else if (showreport == 'excel') {

                        potrebDocs.forEach(d => {
                            d.name = d.name.replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"');
                        });

                        let fileName = i18n.__('Report on the stages of classification1');
                        fileName = fileName.replace("/", "-");
                        fileName += ' (' + dateFormat(new Date(), "HH.MM dd.mm.yyyy") + ')';
                        req.userEvent('Save-to-file', {comment: i18n.__('File-saved') + ' "' + fileName + '"'});

                        let manyDocs = potrebDocs.length > 1 ? true : false;
                        let headerRows = 3;

                        let xlsTable = [
                            [i18n.__('Report on the stages of classification1').replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"')],
                        ];

                        if (!manyDocs) {
                            xlsTable.push([fullArrDocs[0].name]);
                            headerRows++;
                        }

                        xlsTable.push([
                            i18n.__('#p/p'),
                            i18n.__('Name of ND'),
                            i18n.__('Name of Expert'),
                            i18n.__('Report Organization'),
                            i18n.__('Report Department'),
                            i18n.__('Report Phone'),
                            i18n.__('Classification stage')
                        ]);
                        xlsTable.push([1, 2, 3, 4, 5, 6, 7]);
                        potrebDocs.forEach((p, i) => xlsTable.push([(i + 1), p.name, p.step[1].executorName, p.step[1].org, p.step[1].department, p.step[1].phone, p.currTypeName]));

                        xlsx.fromBlankAsync()
                            .then(workbook => {
                                xlsTable[headerRows-2].forEach((v, ii) => workbook.sheet("Sheet1").column("ABCDEFGHIJKLMN"[ii]).width(ii == 1 ? 40 : 25));
                                workbook.sheet("Sheet1").column("A").width(5);
                                workbook.sheet("Sheet1").range("A1", "G1").merged(true);
                                if (!manyDocs) workbook.sheet("Sheet1").range("A2", "G2").merged(true);
                                workbook.sheet("Sheet1").range("A1", "G" + headerRows).style({
                                    "horizontalAlignment": "center",
                                    "verticalAlignment": "bottom",
                                    "fill": 'f2f2f2',
                                    "border": true,
                                    "bold": true
                                });

                                xlsTable.forEach((arr, i) => {
                                    workbook.sheet("Sheet1").row(i+1).height(-1).style({fontSize: 9});
                                    arr.forEach((v, ii) => workbook.sheet("Sheet1").cell("ABCDEFGHIJKLMN"[ii] + (i + 1)).style("wrapText", true).style("verticalAlignment", "top").style("border", true).value(v));
                                });

                                return workbook.outputAsync();
                            }).then(data => {
                            res.attachment(fileName + ".xlsx");

                            res.send(data);
                        })
                            .catch(next);
                    } else {
                        return callback(null, docs);
                    }

                }
            ];

            async.waterfall(arrFunc, (err, result) => {
                if (err)
                    return next(new HttpError(500, err.message));


                if (showreport == 'true') {
                    if (potrebDocs.length > 0) {

                        res.toTemplates.itms = potrebDocs;
                        res.toTemplates.docsCount = potrebDocs.length;
                        res.toTemplates.exportExcel = "?nd=" + listND.join("&nd=") + "&reports=" + reports + "&showreport=excel";
                    }
                    res.status(200);
                    res.render('layouts/reports/reports-type-1', res.toTemplates);
                } else if (showreport != 'excel') {
                    let json = {
                        completed: completedCnt,
                        not_started: notStartedCnt,
                        during: duringCnt,
                        agreement: agreementCnt,
                        na: true
                    };
                    if (potrebDocs.length > 0) {
                        json.na = false;
                    }
                    res.json(json);
                }
            });
        }


        if (reports == 'type-2') {

            let mongoUsrID = req.session.mongoUsrID;
            let moUsers = new moModels.users;


            let q = req.query;
            let filterid = q.filterid;

            let cacheIdList = null;

            if (filterid)
                cacheIdList = req.session.searchKodCache[filterid];

            res.toTemplates.itms = [{empty: true}];

            res.toTemplates.urlFilter = 'reports-type-2-filter';

            let guidExpRev = '60abb27f-37a8-ca06-03a2-74db071f5a42';
            let expertReview = null;

            let titleTh = [];

            let remoteUserList = [];
            let potrebDocs = [];

            let cntAll = 0;

            let arrFunc = [
                function (callback) {

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

                    if (cacheIdList) {

                        condF = cacheIdList.condF || condF;

                        res.toTemplates.exportExcel += '&filterid=' + filterid;
                    }

                    moModels.docs.find({$and: [{nd: {$in: listND}}, condF]}, null, {sort: '-createdAt'}).populate('step.executor').exec((err, docs) => {

                        if (err)
                            return callback(err);

                        if ((!docs) || (docs.length < 1))
                            return callback(null, null);

                        callback(null, docs);
                    });
                },
                function (docs, callback) {

                    if (!docs)
                        return callback(null, null);

                    moUsers.usersInfoMoAndRemot(req, (err, result) => {

                        if (err) return next(err);

                        remoteUserList = result;

                        callback(null, docs);
                    });

                },
                function (docs, callback) {

                    req.extReq.getClassifiers((err, output) => {
                        if (err) return next(err);

                        expertReview = output.filter((i) => {

                            return i.guid === guidExpRev;
                        })[0];


                        expertReview.children.map(i => {

                            if ((!i) || (!i.guid))
                                return;

                            let ch = {
                                name: i.title ? i.title : i.text,
                                guid: i.guid
                            };

                            titleTh.push(ch);
                        });

                        callback(null, docs);
                    });

                },
                function (docs, callback) {

                    if (!docs)
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

                        let attrDoc = moDocs.attToTmpl(d);

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

                        if (outUst.executor)
                            remoteUserList.forEach((u) => {

                                if (!outUst.executor._id.equals(u.id))
                                    return;

                                user = Object.assign({}, u);

                                user.executorName = user.name ? user.name : user.login;
                            });

                        let tAr = {
                            idx: potrebDocs.length + 1,
                            name: attrDoc.name, //имя документа
                            nd: attrDoc.nd,
                            user: user,
                            guides: titleTh.map(tr => {
                                return demands.reduce((o, t) => {
                                    o.length += t.classif
                                        .filter(cl => cl.mainguid == guidExpRev)
                                        .reduce((l, cl) => l + cl.guids.filter(g => g == tr.guid).length, 0);
                                    return o;
                                }, {length: 0});
                            }),

                            dateCreate: '' //dateFormat( new Date( outUst.dateTransfer ), "dd.mm.yyyy" )
                        };
                        for (let i in tAr.guides) {
                            cntAll += tAr.guides[i].length;
                        }

                        if (outUst.dateTransfer)
                            tAr.dateCreate = dateFormat(outUst.dateTransfer, "dd.mm.yyyy");

                        potrebDocs.push(tAr);
                    });


                    callback(null, docs);
                }

                , function (docs, callback) {
                    if (showreport == 'true') {
                        req.userEvent('Report-generation', {comment: i18n.__('Report-generated') + ' "' + i18n.__('Report on classificated documents') + '"'});

                    }
                    if (showreport != 'excel')
                        return callback(null, docs);
                    /*
                     * Для отчётов в Exel
                     */

                    /* --- !!!!! --- */
                    potrebDocs.forEach(d => {
                        d.name = d.name.replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"');
                    });

                    let fileName = i18n.__('Report on classificated documents');
                    fileName = fileName.replace("/", "-");
                    fileName += ' (' + dateFormat(new Date(), "HH.MM dd.mm.yyyy") + ')';
                    req.userEvent('Save-to-file', {comment: i18n.__('File-saved') + ' "' + fileName + '"'});


                    let xlsTable = [
                        [i18n.__('Report on classificated documents').replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"')],
                    ];

                    let manyDocs = potrebDocs.length > 1 ? true : false;
                    let headerRows = 3;

                    if (!manyDocs) {
                        xlsTable.push([fullArrDocs[0].name]);
                        headerRows++;
                    }

                    xlsTable.push([
                        i18n.__('#p/p'),
                        i18n.__('Name of ND'),
                        i18n.__('Name of Expert'),
                        i18n.__('Report Organization'),
                        i18n.__('Report Department'),
                        i18n.__('Report Phone'),
                        i18n.__('Current date')
                    ].concat(titleTh.map(t => t.name)));

                    xlsTable.push([1, 2, 3, 4, 5, 6, 7].concat(titleTh.map((t, i) => 8 + i)));

                    potrebDocs.forEach((p, i) => {

                        let exName = p.user.executorName;

                        let bn = [
                            (i + 1),
                            p.name,
                            exName,
                            p.user.org,
                            p.user.department,
                            p.user.phone,
                            p.dateCreate
                        ].concat(p.guides.map(g => g.length));

                        xlsTable.push(bn);
                    });

                    xlsx.fromBlankAsync()
                        .then(workbook => {
                            xlsTable[headerRows-2].forEach((v, ii) => workbook.sheet("Sheet1").column("ABCDEFGHIJKLMNOPQRSTUVW"[ii]).width(ii == 1 ? 40 : 25));
                            workbook.sheet("Sheet1").column("A").width(5);
                            workbook.sheet("Sheet1").range("A1", "ABCDEFGHIJKLMNOPQRSTUVW"[xlsTable[headerRows-2].length-1] + "1").merged(true);
                            if (!manyDocs) workbook.sheet("Sheet1").range("A2", "ABCDEFGHIJKLMNOPQRSTUVW"[xlsTable[headerRows-2].length-1] + "2").merged(true);
                            workbook.sheet("Sheet1").range("A1", "ABCDEFGHIJKLMNOPRSTUVW"[xlsTable[headerRows-2].length-1] + headerRows).style({
                                "horizontalAlignment": "center",
                                "verticalAlignment": "bottom",
                                "fill": 'f2f2f2',
                                "border": true,
                                "bold": true
                            });

                            xlsTable.forEach((arr, i) => {
                                workbook.sheet("Sheet1").row(i+1).height(-1).style({fontSize: 9});
                                arr.forEach((v, ii) => workbook.sheet("Sheet1").cell("ABCDEFGHIJKLMNOPQRSTUVW"[ii] + (i + 1)).style("wrapText", true).style("verticalAlignment", "top").style("border", true).value(v));
                            });

                            return workbook.outputAsync();
                        }).then(data => {
                        res.attachment(fileName + ".xlsx");

                        res.send(data);
                    })
                        .catch(next);

                }
            ];


            async.waterfall(arrFunc, (err, result) => {

                if (err)
                    return next(new HttpError(500, err.message));

                let url = `/${ global.KServerApi.Route }/reports/type-3`;


                if (showreport == 'true') {
                    potrebDocs.forEach(
                        d => {
                            d.guides = d.guides.map(
                                (g, i) => {
                                    return {
                                        length: g.length
                                            ? `<a href="${ url + '?idnt=' + d.nd + ',' + titleTh[i].guid }" data-xhr-tabs="main-tabs">${ g.length }</a>`
                                            : '0'
                                    };
                                }
                            );
                        }
                    );


                    if (potrebDocs.length > 0) {

                        res.toTemplates.itms = potrebDocs;
                        res.toTemplates.docsCount = potrebDocs.length;
                        res.toTemplates.exportExcel = "?nd=" + listND.join("&nd=") + "&reports=" + reports + "&showreport=excel";
                    }

                    //Возможно временно
                    res.toTemplates.titleTh = titleTh;

                    res.status(200);
                    res.render('layouts/reports/reports-type-2', res.toTemplates);
                } else if (showreport != 'excel') {
                    let json = {
                        cnt: cntAll,
                        na: true
                    };
                    if (potrebDocs.length > 0) {
                        json.na = false;
                    }
                    res.json(json);
                }

            });
        }


        if (reports == 'type-3') {
            let mongoUsrID = req.session.mongoUsrID;
            let moUsers = new moModels.users;

            let cacheIdList = null;

            let q = req.query;
            let filterid = q.filterid;
            let crop = q.c ? parseInt(q.c, 10) : 99;
            let remoteUserList = [];

            res.toTemplates.hideTopMenu = false;

            res.toTemplates.itms = [{empty: true}];

            let expertReview = null;

            res.toTemplates.exportExcel = '?export=excel';

            res.toTemplates.urlFilter = 'reports-type-3-filter';

            if (filterid)
                cacheIdList = req.session.searchKodCache[filterid];


            let ntNd = null;
            let ntGuid = null;

            if (q.idnt) {

                let arrIdnt = q.idnt.split(',');

                ntNd = arrIdnt[0];
                ntGuid = arrIdnt[1];

                res.toTemplates.exportExcel += '&idnt=' + q.idnt;
            }

            let titleU = [{
                name: "",
                css: 'num-puk',
                idx: true,
                row: null
            }, {
                name: i18n.__('Report FIO Expert'),
                guid: null,
                css: 'require-ments',
                isPid: true,
                row: null
            }, {
                name: i18n.__('Report Organization'),
                guid: null,
                css: 'classif classif-1',
                isPid: true,
                row: null
            }, {
                name: i18n.__('Date of classification'),
                guid: null,
                css: 'classif classif-2',
                isPid: true,
                row: null
            }];
            res.toTemplates.titleU = titleU;

            let titleUVal = null;


            let titleTh = [{
                name: i18n.__('#p/p'),
                css: 'num-puk',
                idx: true,
                row: null
            }, {
                name: i18n.__('Requirements1'),
                guid: null,
                css: 'require-ments',
                isPid: true,
                row: null
            }];

            let potrebDocs = [];
            let hashTableClassif = null;

            let cntAll = 0;
            let cntClass = 0;
            let cntNotClass = 0;

            let arrFunc = [
                function (callback) {

                    let condF = {
                        step: {
                            $elemMatch: {
                                typeStep: 99,
                                stage: 1
                            }
                        }
                    };

                    if (ntNd)
                        condF.nd = ntNd;

                    if (cacheIdList) {

                        condF = cacheIdList.condF || condF;

                        res.toTemplates.exportExcel += '&filterid=' + filterid;
                    }

                    moModels.docs.find({$and: [{nd: {$in: listND}}, condF]}, null, {sort: '-createdAt'}, (err, docs) => {

                        if (err)
                            return callback(err);

                        if ((!docs) || (docs.length < 1))
                            return callback(null, null);

                        res.toTemplates.docsCount = docs.length;

                        // Непонятно зачем было нужно но без него работает. Скорее всего имеет отношение к фильтру
                        /*if(!cacheIdList && !ntNd)
                            return callback(null, null);*/

                        callback(null, docs);
                    });
                },
                function (docs, callback) {


                    if (!docs)
                        return callback(null, null);

                    moUsers.usersInfoMoAndRemot(req, (err, result) => {

                        if (err) return next(err);

                        remoteUserList = result;

                        callback(null, docs);
                    });

                },
                function (docs, callback) {

                    req.extReq.getClassifiers((err, output) => {
                        if (err) return next(err);

                        expertReview = output.map((i) => {

                            let ch = {
                                name: i.title ? i.title : i.text,
                                guid: i.guid,
                                row: null,
                                css: 'classif classif-' + titleTh.length
                            };

                            titleTh.push(ch);
                        });

                        hashTableClassif = classifHtml.toHashTableClassif(output)[0];

                        callback(null, docs);
                    });

                },
                function (docs, callback) {

                    if (!docs)
                        return callback(null, null);

                    let demCount = 1;

                    docs.map(d => {

                        let attrDoc = moDocs.attToTmpl(d);

                        let demands = d.demands;

                        let tAr = {
                            idx: potrebDocs.length + 1
                            , name: attrDoc.name
                            , nd: attrDoc.nd
                            , rows: []
                        };

                        tAr.rows = [
                            {name: tAr.name, css: 'name-of-nd', colspan: titleTh.length}
                        ];



                        let outSt = attrDoc.step[0];
                        let stag = {
                            executorName: '',
                            org: '',
                            date: '',
                        };
                        if (outSt.executor)
                            for (let usr = 0; usr < remoteUserList.length; usr++) {
                                let itmUsr = remoteUserList[usr];

                                if ((!itmUsr) || (!itmUsr.id))
                                    continue;

                                if (!ObjectID(itmUsr.id).equals(outSt.executor))
                                    continue;

                                stag.executorName = itmUsr.name ? itmUsr.name : itmUsr.login;
                                stag.org = itmUsr.org;

                                break;
                            }

                        if (outSt.dateTransfer)
                            stag.date = dateFormat(outUst.dateTransfer, "dd.mm.yyyy");

                        titleUVal = [{
                            name: "",
                            css: 'num-puk',
                            idx: true,
                            row: null
                        }, {
                            name: stag.executorName,
                            guid: null,
                            css: 'require-ments',
                            isPid: true,
                            row: null
                        }, {
                            name: stag.org,
                            guid: null,
                            css: 'classif classif-1',
                            isPid: true,
                            row: null
                        }, {
                            name: stag.date,
                            guid: null,
                            css: 'classif classif-2',
                            isPid: true,
                            row: null
                        }];
                        res.toTemplates.titleUVal = titleUVal;


                        potrebDocs.push(tAr);

                        let onlyCuId = null;

                        if (ntGuid)
                            attrDoc.pidsGuids.map((m) => {

                                if (m.guids.indexOf(ntGuid) > -1)
                                    onlyCuId = m.id;
                            });

                        demands.map(c => {

                            if (onlyCuId)
                                if (!c._id.equals(onlyCuId))
                                    return;

                            let demDoc = {
                                css: 'cu-demand'
                                , rows: []
                            };

                            let cloneTit = titleTh.map((ti, i) => {

                                let v = Object.assign({}, ti);
                                v.row = null;
                                if (v.css != "require-ments")
                                    v.css += " __align_center";

                                delete v.name;

                                return v;
                            });


                            cntAll++;

                            let text = [];
                            let sliceText = [];

                            c.pidsText.map(t => {

                                text.push(t.text);

                                if (crop < 0)
                                    return;

                                let ns = t.text.slice(0, crop);

                                if (ns.length < t.text.length)
                                    ns += '...';

                                sliceText.push(ns);
                            });

                            if (sliceText.length < 1)
                                sliceText = text;

                            let isClassified = false;

                            cloneTit.map(ti => {


                                if (ti.isPid) {

                                    if (!ti.row)
                                        ti.row = [];

                                    ti.text = text;
                                    ti.sliceText = sliceText;

                                    return;
                                }


                                if (ti.idx) {

                                    ti.row = [demCount++];

                                    return;
                                }


                                ti.row = ['&mdash;'];


                                c.classif.map(cls => {

                                    if (cls.mainguid !== ti.guid)
                                        return;

                                    ti.row = cls.guids.map(gu => {
                                        let ng = hashTableClassif[gu];

                                        if (!ng)
                                            return;

                                        isClassified = true;
                                        return ng.name;
                                    });
                                });
                            });

                            if (isClassified) {
                                cntClass++;
                            } else {
                                cntNotClass++;
                            }
                            demDoc.rows = cloneTit;

                            potrebDocs.push(demDoc);
                        });

                    });

                    callback(null, docs);
                }
                , function (docs, callback) {

                    callback(null, docs);
                    return;

                    /*
                     * Нужно
                     * Не удалять
                     **/

                    (async function () {
                        let path = '';
                        for (let n in potrebDocs) {
                            if (potrebDocs[n].nd) path = `/kdocapi` + await new Promise((r, j) => {
                                req.kdoc.getContentList(potrebDocs[n].nd, (err, result) => {
                                    r(result.data.getContentList[0].html);
                                });
                            });
                            else {
                                for (let g in potrebDocs[n].rows) {
                                    if (potrebDocs[n].rows[g].isPid) potrebDocs[n].rows[g].row = [(await new Promise((r, j) => {
                                        let pid = potrebDocs[n].rows[g].row.join(','); //potrebDocs[ n ].allPid[ p ];
                                        let options = {
                                            path: path + `?range=${ pid }`,
                                            host: global.KServerApi.VDirInfo.Hostname,
                                            port: global.KServerApi.VDirInfo.Port,
                                            headers: Object.keys(req.headers).filter(k => k != 'host').reduce((o, k) => {
                                                o[k] = req.headers[k];
                                                return o;
                                            }, {})
                                        }
                                        req.extReq.xhr((err, result) => {
                                            if (err) res.send(err);
                                            r(result);
                                        }, options);
                                    }))
                                        .replace(/<style>[\s\S]*?<\/style>/g, '')
                                        .replace(/<\/p>\n[\s\S]*?<p[\s\S]*?>/g, '\r\n\r\n')
                                        .replace(/\r\n\r\n[\b]*/g, '\r\n\r\n')
                                        .replace(/<\/?[\s\S]*?>/g, '').trim()];
                                }
                            }
                        }
                        callback(null, docs);
                    })();
                }

                , function (docs, callback) {
                    if (showreport == 'true') {
                        req.userEvent('Report-generation', {comment: i18n.__('Report-generated') + ' "' + i18n.__('Report on the results of3') + '"'});
                    }
                    if (showreport != 'excel') {
                        return callback(null, docs);
                    }
                    /*
                     * Для отчётов в Exel
                     */

                    let fileName = i18n.__('Report on the results of3');
                    fileName = fileName.replace("/", "-");
                    fileName += ' (' + dateFormat(new Date(), "HH.MM dd.mm.yyyy") + ')';
                    req.userEvent('Save-to-file', {comment: i18n.__('File-saved') + ' "' + fileName + '"'});

                    let xlsTable = [
                        [i18n.__('Report on the results of3').replace(/<br[\s\S]*?>/g, '\r\n').replace(/&quot;/g, '"')],
                        [fullArrDocs[0].name],
                        [""].concat(titleU.filter((t, i) => i).map(t => t.name)),
                        [""].concat(titleUVal.filter((t, i) => i).map(t => t.name)),
                        [
                            i18n.__('#p/p')
                        ].concat(titleTh.filter((t, i) => i).map(t => t.name)),
                        [1].concat(titleTh.filter((t, i) => i).map((t, i) => i + 2))
                    ];
                    potrebDocs.forEach(pd => {
                        if (!pd.nd) {
                            xlsTable.push([xlsTable.length-5].concat(titleTh.filter((t, i) => i).map((t, i) => (pd.rows.filter(g => (i ? g.guid == t.guid : g.isPid))[0] || {row: []})[i ? 'row' : 'text'].join('\r\n').replace('&mdash;', ''))));
                        }
                    });

                    console.log("nnnnnnnn");
                    console.log(xlsTable);


                    //potrebDocs.forEach( ( p, i ) => xlsTable.push( [ ( i + 1 ), p.name, p.texts ] ) );
                    xlsx.fromBlankAsync()
                        .then(workbook => {
                            xlsTable[5].forEach((v, ii) => workbook.sheet("Sheet1").column("ABCDEFGHIJKLMN"[ii]).width(ii == 1 ? 40 : 20).style("wrapText", true).style("verticalAlignment", "top"));

                            workbook.sheet("Sheet1").range("A1", "ABCDEFGHIJKLMN"[xlsTable[5].length-1] + "1").merged(true);
                            workbook.sheet("Sheet1").range("A2", "ABCDEFGHIJKLMN"[xlsTable[5].length-1] + "2").merged(true);
                            workbook.sheet("Sheet1").range("A1", "ABCDEFGHIJKLMN"[xlsTable[5].length-1] + "3").style({
                                "horizontalAlignment": "center",
                                "fill": 'f2f2f2',
                                "border": true,
                                "verticalAlignment": "center",
                                "bold": true
                            });
                            workbook.sheet("Sheet1").range("A5", "ABCDEFGHIJKLMN"[xlsTable[5].length-1] + "6").style({
                                "horizontalAlignment": "center",
                                "fill": 'f2f2f2',
                                "border": true,
                                "verticalAlignment": "center",
                                "bold": true
                            });

                            workbook.sheet("Sheet1").column("A").width(5);

                            xlsTable.forEach((arr, i) => {
                                workbook.sheet("Sheet1").row(i+1).height(-1).style({fontSize: 9});
                                arr.forEach((v, ii) => workbook.sheet("Sheet1").cell("ABCDEFGHIJKLMN"[ii] + (i + 1)).style({border:true, wrapText: true, verticalAlignment: "top"}).value(v));
                            });

                            return workbook.outputAsync();
                        }).then(data => {
                        res.attachment(fileName + ".xlsx");

                        res.send(data);
                    })
                        .catch(next);

                }
            ];


            async.waterfall(arrFunc, (err, result) => {

                if (err)
                    return next(new HttpError(500, err.message));

                if (showreport == 'true') {

                    if (potrebDocs.length > 0) {
                        res.toTemplates.itms = potrebDocs;
                        res.toTemplates.exportExcel = "?nd=" + listND.join("&nd=") + "&reports=" + reports + "&showreport=excel";
                    }

                    //Возможно временно
                    res.toTemplates.titleTh = titleTh;

                    res.status(200);
                    res.render('layouts/reports/reports-type-3', res.toTemplates);
                } else if (showreport != 'excel') {
                    let json = {
                        cntAll: cntAll,
                        cntClassified: cntClass,
                        cntNotClassified: cntNotClass,
                        na: true
                    };
                    if (potrebDocs.length > 0) {
                        json.na = false;
                    }
                    res.json(json);
                }

            });
        }
    });

}
