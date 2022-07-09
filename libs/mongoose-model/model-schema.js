'use strict';

const KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

const log = require('../winston-init')(module);
const async = require('async');
const util = require('util');
const i18n = require('i18n');

const users = mongoose.Schema({
    login: {
        type: String
        ,required: true
        ,index: true
        ,unique: true
        ,lowercase: true
    }
    ,nd: {
        type: Number
        ,index: true
    }
    ,guid: {
        type: String
        ,index: true
    }
    ,serviceUser: {
        type: Number
        ,index: true
    }
    ,removable: {
        type: Boolean
        ,default: true
    }}

    ,{
        timestamps: true
    }
);

users.index({"createdAt": 1});
users.index({"updatedAt": 1});

users.methods._serviceUser = function(callback) {
    var self = this;
    var collectUsers = self.model('users');
    
    collectUsers.findOne({serviceUser: 1}, function(err, serUsr){

       if(err)
           return callback(err);

       if(serUsr)
           return callback(null, serUsr);

       let newUsr = new collectUsers({
           login: i18n.__('Service user of the service')
           ,serviceUser: 1
           ,nd: -1
           ,removable: false
       });
       
       newUsr.save(callback);
    });
};

users.methods.saveOtherUsers = function(arr, callback) {
    var self = this;
    var collectUsers = self.model('users');

    async.map(
        arr,
        (item, callback) => {

            if(!item)
                return callback(null, null);

            if((!item.login) || (!item.guid))
                return callback(null, null);

            let condit = {
                login: String(item.login).toLowerCase()
            };

            let update = {
                 guid: item.guid
            };

            let opt = {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            };

            collectUsers.findOneAndUpdate(condit, update, opt, (err, user) => {

                if(err) return callback(err);

                callback(null, user);
            });

        }, (err, results) => {

            callback(err, results);
    });
};

users.methods.attToTmpl = function(itm) {

    let reto = {
        login: itm.login,
        id: itm.id,
        guid: itm.guid
    };

    return reto;
};

users.methods.foldArrayUsers = function(moUsrs, remoteUsrs) {
    let self = this;
    let collectUsers = self.model('users');
    let attTpl = (new collectUsers).attToTmpl;
    
    let usersList = moUsrs.map(i => {

        let moUsr = attTpl(i);

        remoteUsrs.forEach(r => {

            if((!r) || (!r.guid))
                return;

            if(r.guid !== moUsr.guid)
                return;

            let strTmp = r.department.split(";");
            let department = strTmp[0];
            let org = '';
            if (strTmp[1])
                org = strTmp[1];

            moUsr.login = r.login; //Необходимо сохранить регистр
            moUsr.name = r.fullname;
            moUsr.department = department;
            moUsr.org = org;
            moUsr.email = r.email;
            moUsr.position = r.position;
            moUsr.phone = r.phone;
        });

        return moUsr;
    });

    return usersList;
};

users.methods.usersInfoMoAndRemot = function(req, callback) {
    let self = this;
    let collectUsers = self.model('users');
    let exUsr = new collectUsers;
    
    req.extReq.usersShort((err, output) => {

        if(err) return callback(err);
        
        if(!(output instanceof Array))
            return callback(null, null);

        exUsr.saveOtherUsers(output, (err, result) => {

            if(err) return callback(err);

            let fsd = exUsr.foldArrayUsers(result, output);

            callback(null, fsd);
        });
    });
    
};

const numberReq = mongoose.Schema({
    name: {
         type: String
        ,required: true
        ,unique: true
        ,index: true
    }
    ,author: {
         type: Schema.Types.ObjectId
        ,ref: 'users'
        ,index: true
    }
    ,counter: {
        type: Number
        ,default: 0
    }}

    ,{ timestamps: true }
);

numberReq.methods._requirementsCounter = function(author, callback) {
    let self = this;
    let coll = self.model('numbereq');

    let n = i18n.__('Requirements counter 1');

    coll.findOne({name: n}, function(err, result){

       if(err)
           return callback(err);

       if(result)
           return callback(null, result);

       let newColls = new coll ({
            name: n
           ,author: author
           ,counter: 0
       });

       newColls.save(callback);
    });
};


numberReq.methods.partNameReq = function(obj, callback) {
    let self = this;
    let coll = self.model('numbereq');
    let o = obj || {};

    let bm = o.fromBroom ? 'S-' : '';

    let n = i18n.__('Requirements counter 1');

    coll.findOne({name: n}, function(err, result){

       if(err)
           return callback(err);

       if(!result)
           return callback(new Error(i18n.__('There is no global requirements counter')));
       
       result.counter++;
       
       result.save(function(err, result){

            if(err)
                return callback(err);

            let co = String(result.counter);
            let ze = co.padStart(5, '0');

            ze = 'REQ-'+ bm + ze +'-';

            result.partNameReq = ze;

           callback(null, result);
       });
    });
};


const docs = mongoose.Schema({
    name: {
         type: String
        ,required: true
        ,index: true
    }
    ,author: {
         type: Schema.Types.ObjectId
        ,ref: 'users'
        ,index: true
    }
    ,nd: {
        type: Number
        ,required: true
        ,unique: true
        ,index: true
    }
    ,statusKod: {
         type: String
        ,index: true
    }
    //,redaction: {} //Нужно, не удалять

    ,step: [{
        name: String,
        typeStep: Number,
        current: Number,
        dateTransfer: { type: Date },
        executor: {
            type: Schema.Types.ObjectId
            ,ref: 'users'
            ,index: true
        },
        stage: {
            type: Number,
            default: 0
        },
        notice: [{
            name: String,
            typeNot: Number
        }]
    }]

    ,demands: [{ //Требования
        name: {type: String, index: true},
        nameREQ: {type: String, index: true},
        /*
        tags: [{
            tag: {type: String, index: true}
        }],
        */
        pids: [],
        pidsText: [{
            text: String,
            pid: Number,
            info: Object
        }],
        classif: [{
            mainguid: {type: String, index: true},
            guids: [{type: String, index: true}]
        }],
        dateCreate: { type: Date, default: Date.now }
    }]

    ,demandsCounter: {
        type: Number
        ,default: 0
    }}

    ,{ timestamps: true }
);

docs.index({createdAt: 1});
docs.index({updatedAt: 1});
docs.index({name: "text"}, {name: "indexNameV1", default_language: "russian"});

docs.methods._getKodeksDocInfo = function(nd, KSession, callback) {
    let ndInt = null;
    
    if(!(nd) || (nd == '')) {
        
        callback(new Error('ND is undefined'));
        return;
    }
    
    ndInt = parseInt(nd, 10);
    
    if((isNaN(ndInt)) || (ndInt < 1)) {
        
        callback(new Error('ND is '+ ndInt));
        return;
    }

    KsApi.KodeksDocInfo(ndInt, KSession).then(permissions => {
        let jb = null;

        try {
            jb = JSON.parse(permissions);
            jb['nd'] = ndInt;

        } catch (excep) {}


        callback(null, jb);
    })
    .catch(error => {

        let msgEr = error +' ND '+ nd;

        callback(new Error(msgEr));
    });
};

docs.methods._saveDoc = function(doc, callback) {
    var self = this;
    var d = self.model('docs');
    let objDoc = doc || {};

    if(!objDoc['nd']) {

        return callback(new Error('ND is undefined'));
    }
    
    d.findOne({'nd': objDoc['nd']}, (err, findDoc) => {

        if(err)
            return callback(new Error(err));

        if(findDoc) {

            findDoc.hasAlready = true;

            return callback(null, findDoc);
        }

        let curSaDoc = new d(doc);

        curSaDoc.save((err, saveDoc) => {
            
            if(err)
                return callback(new Error(err));
            
            callback(null, saveDoc);
        });

    });

};

docs.methods.getMuchKodeksDocInfo = function(nd, KSession, callback) {
    let self = this;
    let valDoc = nd;
    let validDocs = [];   

    
    if((!valDoc) || (valDoc == '')) {

        callback(new Error('valDoc is undefined'));
        return;
    }


    if(util.isNumber(valDoc)) {

        if(valDoc > 0)
            validDocs.push( valDoc );
        
    } else if(util.isArray(valDoc)) {
        
        validDocs = valDoc;

    } else if(util.isString(valDoc)) {
        
        let parstt = parseInt(valDoc, 10);
        
        if(parstt > 0)
            validDocs.push( parstt );
    }
    
    if(validDocs.length < 1) {
        
        callback(new Error('validDocs is empty'));
        return;
    }

    let funcArr = [];
    
    for(let i = 0; i < validDocs.length; i++) {
        let itmVDoc = validDocs[i];

        if(!itmVDoc)
            continue;
        
        
        funcArr.push(function(callback){

            self._getKodeksDocInfo(itmVDoc, KSession, (err, attrDoc) => {
                
                if(err) {
                    
                    log.error(err);

                    callback(new Error(err));
                    return;
                }

                callback(null, attrDoc);
            });
        });
    }
    
    
    async.parallel(funcArr, (err, result) => {
        
        if(err)
            return callback(new Error(err));

        callback(null, result);
    });
};

docs.methods.attToTmpl = function(itm) {
    let doc = itm;

    let reprn = String(itm.name).replace(/\r/g, '');
        reprn = reprn.replace(/\n{2,}/g, "\n");
        reprn = reprn.replace(/\n/g, "<br />");

        // Удалить пробелы после переноса строки
        reprn = reprn.replace(/(<br \/>)( )+/g, "$1");

    let nameToTitle = String(itm.name).split(' ').slice(0, 6);
        nameToTitle = nameToTitle.join(' ');
        nameToTitle += '..."';
        
    let nameShort = reprn.split("<br />")[0];

    let reto = {
        name: reprn,
        nameShort: nameShort,
        nameToTitle: nameToTitle,
        nd: itm.nd,
        id: itm.id,
        isdemands: itm.demands.length > 0,
        isclassif: false,
        currTypeStep: null, //Номер этапа классификации
        currTypeName: null, //Название этапа классификации
        step: [],
        allPid: [],
        pidsGuids: [],
        executors: {}
    };

    itm.demands.map(c => {

        if(c.classif.length > 0)
            reto.isclassif = true;
        
        let pids = c.pids.map(p => p);

        let piGu = {
            id: c._id.toString(),
            name: c.name,
            pids: pids,
            pidsText: [],
            guids: []
        };

        c.classif.map(g => {

            piGu.guids = piGu.guids.concat(g.guids);
        });
        
        if(c.pidsText)
            c.pidsText.map(p => {

                piGu.pidsText.push({
                    pid: p.pid,
                    text: p.text,
                    info: p.info
                });
            });


        reto.pidsGuids.push(piGu);

        reto.allPid = reto.allPid.concat(pids);
    });


    reto.step = itm.step.map((itm, i) => {

        let re = {
             name2: doc.currTypeName({currTypeStep: itm.typeStep, isdemands: true})
            ,stage: itm.stage
            ,typeStep: itm.typeStep
        };

        if(itm.current === 1)
            reto.currTypeStep = itm.typeStep;
        
        if(!itm.executor)
            return re;
        
        let execId = null;
        
        if(itm.executor._id) {
            
            execId = itm.executor._id.toString();
        } else {
            
            execId = itm.executor.toString();
        }

        re.executor = execId;

        re.notice = itm.notice.map(x => {
            return {
              name: x.name,
              typeNot: x.typeNot
            };
        });


        if(!reto.executors[execId])
            reto.executors[execId] = {};

        let objsExecuts = reto.executors[execId];

        objsExecuts.stages = objsExecuts.stages || [];
        objsExecuts.stages.push(itm.stage);

        objsExecuts.typeStep = objsExecuts.typeStep || [];
        objsExecuts.typeStep.push( itm.typeStep );

        objsExecuts.notice = objsExecuts.notice || [];
        

        re.notice.map(i => {
            if(!i)
                return;

            objsExecuts.notice.push(i.typeNot);
        });

        return re;
    });

    /*
     * Запасной вариант, для поиска активного этапа классификации
     */
    if(reto.currTypeStep === null)
        reto.currTypeStep = 1;
    
    /*
     * 
     */
    reto.currTypeName = itm.currTypeName(reto);


    return reto;
};

docs.methods.currTypeName = function(attToTmpl) {
    let at = attToTmpl;

    if(!at.isdemands)
        return i18n.__('Stage-Not started');
    
    if(at.currTypeStep === 1) {

        return i18n.__('Stage-During');
    }
    
    if(at.currTypeStep === 2) {

        return i18n.__('On agreement');
    }
    
    if(at.currTypeStep > 90) {

        return i18n.__('Stage-Completed');
    }
};

docs.methods.stepsDoc = function() {

    var s = [
        {name: i18n.__('Definition of requirements and classification'), typeStep: 1, current: 1},
        {name: i18n.__('Harmonization of classification'), typeStep: 2},
        {name: i18n.__('Classification agreed'), typeStep: 99}
    ];
    
    return s;
};

docs.methods.demandAttToTmpl = function(itm) {

    let reto = {
        name: itm.name,
        nameREQ: itm.nameREQ,
        id: itm.id,
        thereAreClassif: itm.classif.length > 0 ? 'there-are-classif' : '',
        pids: itm.pids
    };
    
    if(reto.name !== reto.nameREQ)
        reto.tooltip = reto.nameREQ;

    if(itm.pids)
        reto.strPids = JSON.stringify(itm.pids);

    return reto;
};


/*
docs.methods.preAnnotMakeObj = function(doc, options) {
    let opt = options || {};

    let nameIssue = String(doc.name).replace("\n", "<br />");

    let r = {
        name: nameIssue,
        nd: doc.nd,
        id: doc.id
    };

    return r;
};

docs.methods.getDocs = function(conditions, projection, options, callback) {
    let self = this;
    let docsMod = self.model('docs');
    let myMethod = new docsMod;

    docsMod.find(conditions, projection, options, function(err, colls) {

        if(err)
            return callback(err);

       colls = colls || [];
       
       let arrVals = [];

        arrVals = colls.map((itm) => {

            let fus = myMethod.preAnnotMakeObj(itm);

            return fus;
        });


        callback(null, {docs: arrVals});
    });
};
*/

const docs_collections = mongoose.Schema({
    name: {
        type: String
        ,required: true
        ,index: true
    }
    ,author: {
         type: Schema.Types.ObjectId
        ,ref: 'users'
        ,index: true
    }
    ,removable: {
        type: Boolean
        ,default: true
    }
    ,serviceCollect: {
        type: Number
        ,index: true
    }
    ,docs: [{
        type: Schema.Types.ObjectId,
        ref: 'docs',
        index: true
    }]}
    
    ,{
        timestamps: true // createdAt && updatedAt
    }
);

docs_collections.index({createdAt: 1});
docs_collections.index({updatedAt: 1});


docs_collections.methods._serviceCollect = function(author, callback) {
    let self = this;
    let docColls = self.model('docs_collections');
    
    docColls.findOne({serviceCollect: 1}, function(err, result){

       if(err)
           return callback(err);

       if(result)
           return callback(null, result);

       let newColls = new docColls({
            name: i18n.__('Default Collection')
           ,author: author
           ,serviceCollect: 1
           ,removable: false
       });

       newColls.save(callback);
    });
};

docs_collections.methods.getCollections = function(conditions, projection, options, callback) {
    let self = this;
    let docColls = self.model('docs_collections');

    docColls
            .find(conditions, null, {sort: 'createdAt'})
            .populate({path: 'docs', options: {sort: '-createdAt'}})
            .exec(callback);
};

docs_collections.methods.attToTmpl = function(itm) {

    let reto = {
        name: itm.name
        ,id: itm.id
        ,docsLength: itm.docs.length
        ,collsCountDocs: itm.docs.length > 0 ? 'colls-count-docs' : ''
        ,selected: itm.selected ? 'selected' : null
        ,serviceCollect: itm.serviceCollect
        ,cssClass: itm.serviceCollect ? 'service-collect' : 'no-service-collect'
    };

    return reto;
};

/*
docs_collections.methods.findByIdAndUpdateCollection = function(id, update, options, callback) {
    let self = this;
    let docColls = self.model('docs_collections');
    
    docColls.findByIdAndUpdate(id, update, options, function(err, result){

        if(err)
            return callback(err);
        
        callback(null, result);
    });
};
*/
/*
docs_collections.methods.getCollectionDocs = function(id, projection, options, callback) {
    let self = this;
    let docColls = self.model('docs_collections');
   
    docColls
            .findById(id)
            .populate('docs')
            .exec(function (err, coll) {
                
                if(err)
                    return callback(err);

                if(!coll)
                    return callback(null, null);
                
                callback(null, coll);
    });
};
*/


docs_collections.methods.addCollectionDocs = function(id, docsId, callback) {
    let self = this;
    let docColls = self.model('docs_collections');
    //let docsMod = self.model('docs');
 
    docColls.findById(id, function(err, currCollect) {
        
        if(err)
            return callback(err);
        
        if(!currCollect)
            return callback(new Error(i18n.__('Collection does not exist')));
        
        let arrDocsId = [];
        
        if(docsId instanceof Array) {
            
            arrDocsId = [].concat(docsId);
        } else {
            
            arrDocsId.push(docsId);
        }
        
        let opt = {
            new: true
        };
    
        docColls.findByIdAndUpdate(currCollect._id, {$addToSet: {docs: {$each: arrDocsId}} }, opt, (err, raw) => {

            if(err)
                return callback(new Error(err));

            callback(null, raw);
        });
        
    });

};

docs_collections.methods.delCollectionDocs = function(id, nd, callback) {
    let self = this;
    let docColls = self.model('docs_collections');
    let docsMod = self.model('docs');

    let collect = null;
    let doc = null;

    let arrFunc = [
        function(callback) {

            docColls.findById(id, function(err, co) {

                if(err)
                    return callback(err);

                if(!co)
                    return callback(new Error(i18n.__('Collection does not exist')));
                
                collect = co;

                callback(null, null);
            });
        }
        ,function(result, callback) {

            docsMod.findOne({nd: nd}, function(err, d){
                
                if(err)
                    return callback(err);
                
                if(!d)
                    return callback(new Error(i18n.__('Could not find document')));
                
                doc = d;

                callback(null, null);
            });
        }
        ,function(result, callback) {
            let ind = collect.docs.indexOf(doc.id);

            if(ind < -1)
                return callback(null, null);

            collect.docs.splice(ind, 1);

            collect.save((err, ss) => {

                if(err)
                    return callback(err);

                callback(null, null);
            });
        }
        ,function(result, callback) {

            if(collect.serviceCollect !== 1)
                return callback(null, null);
            
            let docID = doc.id;

            docColls.find({docs: {$in:[ doc._id ]}}, function(err, collDoc){

                if(err)
                    return;

                if(collDoc.length < 1)
                    return;

                collDoc.forEach((cd) => {
                    let ind = cd.docs.indexOf(docID);
                    
                    if(ind < 0)
                        return;
                    
                    cd.docs.splice(ind, 1);
                    
                    cd.save();
                });
                
            });

            doc.remove((err, rr) => {

                if(err)
                    return callback(err);

                callback(null, null);
            });
        }
    ];

    async.waterfall(arrFunc, callback);

};

const readyMade = mongoose.Schema({
    name: {
         type: String
        ,required: true
        ,index: true
    }
    ,author: {
         type: Schema.Types.ObjectId
        ,ref: 'users'
        ,index: true
    }
    ,public: {
        type: Number,
        default: 0,
        index: true
    }
    ,classif: [{
        mainguid: String,
        guids: []
    }]
    ,demref: [{
        type: Schema.Types.ObjectId,
        index: true
    }]}

    ,{ timestamps: true }
);


readyMade.index({createdAt: 1});
readyMade.index({updatedAt: 1});


readyMade.methods.attToTmpl = function(itm) {

    let reto = {
        name: itm.name,
        id: itm.id,
        guids: []
    };

    itm.classif.map(i => {

        if((!i.guids) || (i.guids.length < 1))
            return;

        reto.guids = reto.guids.concat(i.guids);
    });

    reto.public = (itm.public == 1) ?  '' : 'checked';

    return reto;
};


module.exports = (moDB) => {

    let retObj = {
         docs: moDB.model('docs', docs)
        ,users: moDB.model('users', users)
        ,doccoll: moDB.model('docs_collections', docs_collections)
        ,readyMade: moDB.model('readyMade', readyMade)
        ,numbeReq: moDB.model('numbereq', numberReq)
    };

    let serUsr = new retObj.users();
    let nuReq = new retObj.numbeReq();

    serUsr._serviceUser(function(err, user){

        if(err)
            return err;


        let doccoll = new retObj.doccoll();
         
        doccoll._serviceCollect(user.id, () => {});

        nuReq._requirementsCounter(user.id, () => {});
    });

    return retObj;
};
