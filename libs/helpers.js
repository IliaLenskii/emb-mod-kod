'use strict';

let KsApi = global.KServerApi || {};

const pathRoot = KsApi.RootPath;

const fs = require('fs');
const i18n = require('i18n');
const crypto = require('crypto');
const util = require('util');

let userConf = require(pathRoot +'/config');
let userConfSite = userConf['site'];

let objHelpers = {

    section: function(name, options) {

        if (!this._sections)
            this._sections = {};

        this._sections[name] = options.fn(this);

        return null;
    },
    
    makeTitle:(v) => {

        let tit = i18n.__('serviceName');

        if(!v)
            return tit;
        
        tit = (v +' / '+ tit);

        return tit;
    },

    siteConf: function(n) {
        
        if(n === 'url')
            return '/'+ KsApi.Route +'/';

        return userConfSite[n] || '';
    },

    getOldjQuery: function (n, v) {

        var old = userConfSite['jQueryOld'];
        var norm = userConfSite['jQueryNorm'];

        if(n != 'ie')
            return norm;

        if(n == 'ie' && v > 8)
            return norm;

        return old;
    },

    i18n: function(n, s){
        
        
        /*
         * Переписать вызов в контексте i18n с сохранением аргрументов 
         */

        return i18n.__(n, s);
    },

    'evil-Icons': (() => {

        let filePath = pathRoot +'/public/images/svg/evil-Icons.svg';

        if(!fs.existsSync(filePath)) {

            console.error('File not exists: '+ filePath);

            return;
        }

        let evilIcons = fs.readFileSync(filePath, 'utf8');

        return evilIcons;
    })(),

    'product-icons': (() => {

        let filePath = pathRoot +'/public/images/svg/product-icons.svg';

        if(!fs.existsSync(filePath)) {

            console.error('File not exists: '+ filePath);

            return;
        }

        let svgIcons = fs.readFileSync(filePath, 'utf8');

        return svgIcons;
    })(),
    
    toJSON: (v) => {
        
        return JSON.stringify(v);
    },

    rndStr: (v) => {
        let len = !util.isNumber(v) ? 8 : v; 
        let buf = 'r'+ (crypto.randomBytes(len).toString('hex'));

        return buf;
    },
    
    packageVal: function(n) {

        return KsApi.Info[n];
    },
    
    textUrlAnnot: function(n) {
        let t = this;
        
        if(!t.editing)
            return i18n.__('See classification');
        
        //С этим согласовать
        //docs.methods.currTypeName = function(attToTmpl) {
        
        if(t.currTypeStep === 1) {

            if(t.isdemands)
                return i18n.__('Continue Classification');
            else
                return i18n.__('Start the classification');
        }
        
        if(t.currTypeStep === 2) {
            
            return i18n.__('Harmonization of classification');
        }
    },

    // Добавление простых математических выражений или сравнений в handlebars, напр. {{#if (math x '==' y)}}
    math: function( a, op, b ) {
        if ( !!~'==!='.indexOf( op ) ) return eval( '"' + a + '"' + ( op ? op : '+' ) + '"' + b + '"' );
        if ( !!~'+-%*/'.indexOf( op ) ) return eval( a + op + b );
    },
    
    accessHidden: function(g){
        var self = this;
        let arrK = String(g).split(',');

        if(!arrK)
            return false;
        
        let o = arrK.filter(i => {
            
            return self.access[i];
        });
        
        return o.length > 0;
        
/*        
{{#if (accessHidden 'admin')}}

{{/if}}
*/


/*

access
 
access:
admin:false
creator:false
expert-nii:false
expert-pao:false

expert-pao,creator

reports:false

    
req.checkAccess( 'admin' );
req.checkAccess( 'expert-pao' );
req.checkAccess( 'expert-nii' );
req.checkAccess( 'reports' );

{{#if (access/creator)}}
    

 */
        
        return true;
    },
    ifCond: function (v1, operator, v2, options) {
        /*
         * 
         * https://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
         */

        switch (operator) {
            case '==':
                return (v1 == v2) ? true : false;
            case '===':
                return (v1 === v2) ? true : false;
            case '!=':
                return (v1 != v2) ? true : false;
            case '!==':
                return (v1 !== v2) ? true : false;
            case '<':
                return (v1 < v2) ? true : false;
            case '<=':
                return (v1 <= v2) ? true : false;
            case '>':
                return (v1 > v2) ? true : false;
            case '>=':
                return (v1 >= v2) ? true : false;
            case '&&':
                return (v1 && v2) ? true : false;
            case '||':
                return (v1 || v2) ? true : false;
            default:
                return false;
        }
    },
    inputType: function(){
        let t = this;

        if(t.inputType)
            return t.inputType;

        return 'checkbox';
    }
};

module.exports = objHelpers;
