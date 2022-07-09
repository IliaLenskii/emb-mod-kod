'use strict';

const i18n = require('i18n');

let superGuid = null;
let dataRequired = null;

function toUL( arr, rank ) {
    if ( rank === undefined ) return arr.map( el => toUL( [ el ], 0 ) );

    let nArr = arr || [];

    if((!nArr) || (nArr.length < 1))
        return;

    let stCls = (rank === 0 ? ' cls-fi-ul' : '');

    let itmHtm = '<ul class="in-rank-'+ rank + stCls +'">';

    for(let i = 0; i < nArr.length; i++) {
        let itm = nArr[i];

        if(!itm)
            continue;

        let itmId = itm.guid;
        let itmName = itm.text || itm.title;
        let itmTitle = itm.title || '';
        
        let hidden = itm.hidden;

        let itmCode = itm.code;
        let itmRoot = itm.root;
        let itmChildren = itm.children;

        let secondItmHtm = toUL(itmChildren, (++rank));

        let isChildTree = itmChildren ? ' have-children ' : ' end-branch ';

        let dataVal = (itm.value != null ? 'data-val="'+ itm.value +'"' : '');
        let dataId = 'data-guid="'+ itmId +'"';

        let spNa = ('<span>'+ itmName +'</span>');
        let arrow = (secondItmHtm ? '<i class="arrow_blue ic-1"></i>' : '');

        let itColor = (itm.colorSquare ? '<span class="sp-col">'+ itm.value +'.</span>' : '');
        
        let stHide = hidden ? ' itm-inactive ' : '';

        itmHtm += '<li>';

        itmHtm += (
            '<a href="javascript:;" '+
            dataId
            +' '+
            dataVal +
            ' title="'+ itmTitle +'" '+
            ' class="ia '+ isChildTree + stHide+'">'+
            arrow +
            itColor +
            spNa +
            '</a>'
        );

        if(secondItmHtm)
            itmHtm += secondItmHtm;

        itmHtm += '</li>';
    }

    itmHtm += '</ul>';

    return itmHtm;
};


function toULInForm( arr, rank, obj ) {
    obj = obj || {};

    if(rank === null || rank === undefined) {

        if(obj.dataRequired)
            dataRequired = obj.dataRequired;
        else
            dataRequired = null;
        
        return arr.map( el => toULInForm( [ el ], 0 ) );
    }

    let nArr = arr || [];

    if((!nArr) || (nArr.length < 1))
        return;

    let typeRadio = [
        '60abb27f-37a8-ca06-03a2-74db071f5a42'
        //,'ded23ac8-dd71-9e56-0aaf-2604efe21244'
        //,'13f1bcde-a1c4-f056-c123-433504ce6a94'
    ];
    

    let stCls = (rank === 0 ? ' cls-fi-ul' : '');

    let itmHtm = '<ul class="in-rank-'+ rank + stCls +'">';

    for(let i = 0; i < nArr.length; i++) {
        let itm = nArr[i];

        if(!itm)
            continue;

        let guid = itm.guid;
        let itmName = itm.text || itm.title;
        let itmTitle = itm.title || '';
        
        let hidden = itm.hidden;

        let itmCode = itm.code;
        let itmRoot = itm.root;
        let itmChildren = itm.children;

        superGuid = stCls ? guid : superGuid;

        let secondItmHtm = toULInForm(itmChildren, (++rank));
        let isChildTree = itmChildren ? ' have-children ' : ' end-branch ';

        let expRev = typeRadio.indexOf(superGuid) > -1;
        
        let addChooseAll = (!expRev ? '<a href="javascript:;" class="choose-all">'+ i18n.__('Choose all') +'</a>' : '');

        if(hidden)
            continue;

        itmHtm += ('<li>');

        if(stCls) {

            itmHtm += (
                '<div class="exp-all-bran">'+
                    '<a href="javascript:;" class="exp-all-evt">'+ itmName +'</a>'+
                    '<div class="when-abs">'+
                        '<div class="just-a-name">'+ itmName +'</div>'+
                        addChooseAll+
                        '<a href="javascript:;" class="remove-all">'+ i18n.__('Remove all') +'</a>'+
                    '</div>'+
                    '<div class="search-to-classif">'+
                        '<input type="text" class="it star-sear-class" maxlength="50" spellcheck="false" placeholder="'+ i18n.__('Enter a phrase to search for') +'" />'+
                        '<a href="javascript:;" class="icon-cross trans-anim" title="'+ i18n.__('Clear') +'"><svg><use xlink:href="#ei-close-icon"></use></svg></a>'+
                        '<div class="search-result"></div>'+
                    '</div>'+
                '</div>'
            );

        } else {

            let exTyp = expRev ? 'radio' : 'checkbox';
            let attrDatReq = dataRequired ? 'data-required="'+ dataRequired +'"' : '';

            itmHtm += (
                '<label class="lab-classif '+ isChildTree +'" title="'+ itmTitle +'">'+
                '<input type="'+ exTyp +'" class="vfm" name="guids['+ superGuid +'][]" value="'+ guid +'" '+ attrDatReq +' />'+
                '<span>'+ itmName +'</span>'+
                '</label>'
            );
        }

        if(secondItmHtm)
            itmHtm += secondItmHtm;

        itmHtm += '</li>';
    }

    itmHtm += '</ul>';

    return itmHtm;
};


let hashTable = null;

function toHashTableClassif( arr, rank ) {

    if (rank === undefined || rank === undefined) {
        
        hashTable = {};
        
        return arr.map( el => toHashTableClassif( [ el ], 0 ) );
    }

    let nArr = arr || [];

    if((!nArr) || (nArr.length < 1))
        return;

    for(let i = 0; i < nArr.length; i++) {
        let itm = nArr[i];

        if(!itm)
            continue;

        let guid = itm.guid;
        let itmName = itm.text || itm.title;
        let itmTitle = itm.title || '';
        
        let hidden = itm.hidden;

        let itmCode = itm.code;
        let itmRoot = itm.root;
        let itmChildren = itm.children;

        let secondItmHtm = toHashTableClassif(itmChildren, (++rank));

        if(hidden)
            continue;

        hashTable[guid] = Object.assign({}, itm);
        hashTable[guid].name = itmName;

        if(itmChildren)
            delete hashTable[guid].children;
    }

    return hashTable;
};

    
function toULInFormNoEdit( arr, rank ) {

    if ( rank === undefined )
        return arr.map( el => toULInFormNoEdit( [ el ], 0 ) );

    let nArr = arr || [];

    if((!nArr) || (nArr.length < 1))
        return;

    let stCls = (rank === 0 ? ' cls-fi-ul' : '');

    let itmHtm = '<ul class="in-rank-'+ rank + stCls +'">';

    for(let i = 0; i < nArr.length; i++) {
        let itm = nArr[i];

        if(!itm)
            continue;

        let guid = itm.guid;
        let itmName = itm.text || itm.title;
        let itmTitle = itm.title || '';
        
        let hidden = itm.hidden;

        let itmCode = itm.code;
        let itmRoot = itm.root;
        let itmChildren = itm.children;

        //superGuid = stCls ? guid : superGuid;

        let secondItmHtm = toULInFormNoEdit(itmChildren, (++rank));
        let isChildTree = itmChildren ? ' have-children ' : ' end-branch ';
        
        if(hidden)
            continue;

        itmHtm += ('<li>');

        if(stCls) {

            itmHtm += (
                '<div class="exp-all-bran">'+
                    '<a href="javascript:;" class="exp-all-evt">'+ itmName +'</a>'+
                    '<div class="when-abs">'+
                        '<div class="just-a-name">'+ itmName +'</div>'+
                    '</div>'+
                '</div>'
            );

        } else {

            itmHtm += (
                '<label class="lab-classif onl-g '+ isChildTree +'" title="'+ itmTitle +'">'+
                '<input type="checkbox" class="vfm" value="'+ guid +'" />'+
                '<span>'+ itmName +'</span>'+
                '</label>'
            );
        }

        if(secondItmHtm)
            itmHtm += secondItmHtm;

        itmHtm += '</li>';
    }

    itmHtm += '</ul>';

    return itmHtm;
};

module.exports.toUL = toUL;
module.exports.toULInForm = toULInForm;
module.exports.toULInFormNoEdit = toULInFormNoEdit;
module.exports.toHashTableClassif = toHashTableClassif;