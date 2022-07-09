//
//

Classification_Subsystem_Utilities.prototype.uniqid = function(obj) {
        var self = this;
        var obj = obj || {};
        var stopMill = obj['stopMill'] || 1;
        var prefix = obj['prefix'] || null;

        (function(stopMill){
                var date = new Date();
                var curDate = null;

                do {
                        curDate = new Date();
                } while((curDate - date) < stopMill);
        })(stopMill);

        var rndChar = function(l) {
                var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
                var l = l || 1;
                var ret = '';

                for(var i = 0; i < l; i++) {
                        var r = Math.floor((Math.random() * chars.length));

                        ret += chars[r];
                }

                return ret;
        };

        var currMill = +new Date;

        if(obj['pointCheck']) {

                var pCh = (currMill.toString()).split('');
                        pCh = (pCh.slice(pCh.length - 5));
                        pCh.reverse();

                currMill = (rndChar(3) + pCh.join(''));
        }

        if(prefix)
                currMill = prefix + currMill;

        return currMill;
};

Classification_Subsystem_Utilities.prototype.placeholderEmulation = function(obj) {
    var obj = obj || {};
    var els = $(obj['els']);

    if(document.createElement('input').placeholder !== undefined)
        return;

    els.each(function() {
        var el = $(this);
        var elForm = this.form;

        var addPlaceholder = function(el) {
            var ee = $(el);

            if(ee.val() === '') {

                ee.val(ee.attr('placeholder')).addClass('placeholder');
            }
        };

        var removePlaceholder = function(el) {
            var ee = $(el);
            
            if(!ee.hasClass('placeholder'))
                return;

            if(ee.attr('placeholder') === ee.val()) {

                ee.val('').removeClass('placeholder');
            }
        };

        addPlaceholder(el);

        el.focus(function(){
            removePlaceholder(this);
        });

        el.blur(function(){
            addPlaceholder(this);
        });

        if(elForm) {

            $(elForm).submit(function() {
                var elsPlac = $('input[placeholder]', this);

                elsPlac.each(function() {

                    removePlaceholder(this);
                });
            });
        }

    });
};

Classification_Subsystem_Utilities.prototype.requiredValidationFormElem = function(obj) {
    var self = this;
    var obj = obj || {};
    var jquEl = $(obj.el);
    var e = obj.e;

    if(jquEl.length < 1)
        return;

    var attrReq = jquEl.data('required');

    if(!attrReq)
        return;

    var attrName = jquEl.attr('name');
    var attrMinlength = jquEl.data('minlength');
    var attrMaxlength = jquEl.attr('maxlength');
    var attrType = jquEl.attr('type');
    var attrPattern = jquEl.data('pattern');
    var attrValue = jquEl.val();

    var attrForm = $(jquEl.prop('form'));

    if(attrType === 'text') {
        attrValue = $.trim( String(attrValue) );

        var isInvEl = null;

        if((!attrValue) || (attrValue === '')) {

            isInvEl = true;

        } else if(attrPattern) {

            var reExPattern = new RegExp(attrPattern, 'ig');

            if(!reExPattern.test(attrValue))
                isInvEl = true;

        } else if(attrMinlength) {

            if(attrValue.length < attrMinlength)
                isInvEl = true;
        }

        if(isInvEl) {

            return jquEl;
        }
    }

    if(attrType === 'hidden') {

        attrValue = $.trim( String(attrValue) );

        var isInvEl = null;

        if((!attrValue) || (attrValue === '')) {

            isInvEl = true;
        }

        if(isInvEl) {

            return jquEl;
        }
    }

    if(e)
        return;

    if((attrType === 'checkbox' || attrType === 'radio') && attrName) {

        if(attrForm.length < 1)
            return;

//        if(attrReq !== 1 && e)
//            return;

        var arrColl = $(attrForm[0][attrName]).filter('input:checked');

        if(arrColl.length < 1) {

            return jquEl;
        }
    }
    
    /*
    if(attrType === 'radio' && attrName) {

        if(attrForm.length < 1)
            return;

        var arrColl = $(attrForm[0][attrName]).filter('input:checked');
        
        //console.log( arrColl );

        if(arrColl.length < 1) {

            d.retEl.push( jquEl );
        }
    }
    */
};

Classification_Subsystem_Utilities.prototype.hotValidInput = function(obj) {
    var self = this;
    var obj = obj || {};
    var form = obj['form'];
    
    var jquForm = $(form);
    var submitBtn = $('button[type="submit"], button.not-submit', jquForm);
    var listValid = $('input[data-required]', jquForm);

    var dataReq_1 = $('input[data-required="1"]', jquForm);
    var dataReq_2 = $('input[data-required="2"]', jquForm);
    
    var textAndHidden = listValid.filter('input[type="text"], input[type="hidden"]');
    var checkboxAndRadio = listValid.filter('input[type="checkbox"], input[type="radio"]');

    jquForm.on('form-check', function(e, data){
        var data = data || {};
        var currEl = $(data.el);

        var errR1 = $();
        var errR2 = $();

        if(currEl.length > 0) {

            var ch = self.requiredValidationFormElem({el: currEl, e: e});

            if(data.clear)
                ch = false;

            currEl.toggleClass('__invalid', ch ? true : false);
        }


        var nameCheRadio = {};

        checkboxAndRadio.each(function(){
            var c = $(this);
            var n = c.prop('name');

            if(!n)
                return;

            nameCheRadio[n] = n;
        });
        
        $.each(nameCheRadio, function(na){
            
            var itms = $('input[name="'+ na +'"]', jquForm);
            
            if(itms.length < 1)
                return;

            var f = itms.first();

            var ch = self.requiredValidationFormElem({el: f});
            
            if(!ch)
                return;

            var attrReq = f.data('required');
            
            if(attrReq === 1)
                errR1 = errR1.add(itms);
            
            if(attrReq === 2)
                errR2 = errR2.add(itms);
        });

        textAndHidden.each(function(){
            var itm = $(this);
            
            var ch = self.requiredValidationFormElem({el: itm});
            
            if(!ch)
                return;

            var attrReq = itm.data('required');

            if(attrReq === 1)
                errR1 = errR1.add(itm);

            if(attrReq === 2)
                errR2 = errR2.add(itm);
        });

        var dis = true;

        if(dataReq_2.length > 0) {

            dis = errR2.length >= dataReq_2.length;
        } else {
            
            dis = false;
        }

        if(dataReq_1.length > 0)
            dis = errR1.length > 0 || dis;

        submitBtn.prop('disabled', dis);

        errR1 = errR2 = null;
    });

    textAndHidden.on('input', function(e){
        var el = $(this);

        jquForm.trigger('form-check', {el: el});
    });

    textAndHidden.on('val-change', function(e, d){
        var el = $(this);
        var d = d || {};

        if((d.val !== null) || (d.val !== undefined))
            el.prop('value', d.val);
        else
            el.prop('value', null);

        jquForm.trigger('form-check', {el: el, clear: true});
    });

    textAndHidden.on('focus', function(){
        var el = $(this);
        var val = el.val();

        if(val && val != '')
            el.trigger('input');

    }).on('blur.special', function(){
        var el = $(this);

        el.removeClass('__invalid');
    });

    checkboxAndRadio.on('change', function(){
        var el = $(this);

        jquForm.trigger('form-check', {el: el});
    });


    $('.icon-cross.cle', jquForm).click(function(){
        var el = $(this);
        var parr = el.parent();

        var inp = $('input', parr);
        var inpDataReq = inp.filter('[data-required]');
        var inpReadOnly = inp.filter('[readonly]');

        inpDataReq.trigger('val-change', {val: null});

        inpReadOnly.prop('value', null);
    });


    if(textAndHidden.length < 1)
        return;

    if(('onpropertychange' in textAndHidden[0])) {

        textAndHidden.on('keyup', function(e){
            $(this).trigger('input');
        });
    }
};

Classification_Subsystem_Utilities.prototype.valToArray = function(obj) {
    var self = this;
    var obj = obj || {};
    var els = $(obj['els']);
    
    if(els.length < 1)
        return;

    els.on('addRemovePids', {}, function(event, data){
        var el = $(this);
        var d = data || {};
        var pid =  $.isArray(data.pid) ? data.pid : [data.pid];
        var add = data.add;

        var val = el.val();
            val = !val ? [] : JSON.parse(val);

        var newVal = [].concat(val);

        if(!add) {

            newVal = val.filter(function(e, i, arr){

                return pid.indexOf(e) < 0;
            });

        } else {

            newVal = newVal.concat(pid);
        }
        
        newVal = newVal.filter(function(itm, i, farr) {

            return farr.indexOf(itm) === i;
        });

        var convVal = '';

        if(newVal.length > 0)
            convVal = JSON.stringify(newVal);

        el.val( convVal );
        el.trigger('input');
    });
};

Classification_Subsystem_Utilities.prototype.formReset = function(obj) {
    var self = this;
    var obj = obj || {};
    var form = obj['form'];
    var callback = obj['callback'];

    if(!form)
        return;

    var jquForm = $(form);

    if(jquForm.length < 1)
        return;

    var nativForm = form[0];

    var elemForm = nativForm.elements;

    for(var i = 0; i < elemForm.length; i++) {
        var itm = elemForm[i];

        if(!itm)
            continue;

        var jquItm = $(itm);
        var itmType = jquItm.attr('type');
        var attrCanClear = jquItm.data('can-clear');
        var psdSubmit = jquItm.hasClass('not-submit');

        if(!attrCanClear)
            continue;

        if(itmType == 'hidden' || itmType == 'button') {

            jquItm.removeAttr('value');
        }

        if(itmType == 'submit' || psdSubmit) {

            jquItm.prop('disabled', true);
        }
    }

    nativForm.reset();
    
    if(callback)
        callback(jquForm);
};

Classification_Subsystem_Utilities.prototype.i18n = function() {
    var self = this;
    var obji18n = self.pluginKodObj.i18n || {};
    var arg = arguments;

    if(arg.length < 1)
        return;

    return obji18n.hasOwnProperty(arg[0]) ? obji18n[ arg[0] ] : null;
};

Classification_Subsystem_Utilities.prototype.ajaxSuccessEmpty = function() {
    var self = this;
    var data = arguments[0];
    var textStatus = arguments[1];
    var jqXHR = arguments[2];
    var candidateCallback = arguments[ arguments.length - 1 ];
    var callback = null;
    
    var errObj = jqXHR.responseJSON;
    
    var errmsg = null;

    if(errObj)
        errmsg = errObj.error;

    if(typeof candidateCallback === 'function')
        callback = candidateCallback;

    if(data && data !== '')
        return true;

    var htmlNull = self.i18n('Server response error');

    var dialogs = $("div#dialogs .ui-dialog-content");

    if(dialogs.length > 0) {

        var tmplErr = $('.pieces-tmpl .template-ajax-error').clone();

        $('.error-title', tmplErr).html(htmlNull);

        dialogs.html(tmplErr);

    } else {
        
        alert(htmlNull);
    }

    if(callback)
        callback();
};

Classification_Subsystem_Utilities.prototype.ajaxError = function() {
    var self = this;
    var jqXHR = arguments[0];
    var textStatus = arguments[1];
    var errorThrown = arguments[2];

    var errObj = jqXHR.responseJSON;
    var errResText = jqXHR.responseText;
    
    var attrAction = jqXHR.url;

    var candidateCallback = arguments[ arguments.length - 1 ];
    var callback = null;
    
    if(typeof candidateCallback === 'function')
        callback = candidateCallback;
    
    var errmsg = null;
    
    if(errObj) {

        errmsg = errObj.error;
    } else {

        errmsg = errorThrown +' ['+ jqXHR.status +']';
        errmsg += "\r\n"+ attrAction;
    }

    var dialogs = $("div#dialogs .ui-dialog-content");

    if(dialogs.length > 0) {

        var tmplErr = $('.pieces-tmpl .template-ajax-error').clone();

        $('.error-title', tmplErr).html(errmsg);

        dialogs.html(tmplErr);

    } else {
        
        alert(errmsg);
    }

    if(callback)
        callback();
};

Classification_Subsystem_Utilities.prototype.openjQueryDialog = function(obj) {
    var self = this;
    var obj = obj || {};
    var htmlBody = obj.htmlBody;
    var openCallBack = obj.openCallBack;
    var closeCallBack = obj.closeCallBack;
    var dialogClass = obj.dialogClass || '';
    var appendTo = obj.appendTo || $("div#dialogs");
    var spinner = obj.spinner;

    var posPer = function(d) {
        var winWidth = $(window).width();
        var winHeight = $(window).height();        

        var cor = d.offset();

        var wi = ((cor.left / winWidth) * 100).toFixed(6);
        var he = ((cor.top / winHeight) * 100).toFixed(6);

        return {
            top: he,
            left: wi
        };
    };
    
    var htmlSpinner = null;
    
    if(spinner) {
        
        htmlSpinner = $('.pieces-tmpl .global-spinner').clone();
        htmlSpinner.toggleClass('global-spinner dialog-spinner');
    }


    if(!htmlBody) {
        
        htmlBody = $('<div><div class="empty-dlk" /></div>');
    }

    var dialog = htmlBody.dialog({
        autoOpen: true,
        appendTo: appendTo,
        width: (obj['width'] ? obj['width'] : 'auto'),
        height: (obj['height'] ? obj['height'] : 'auto'),
        position: { my: "center", at: "center", of: window },
        title: obj.title || '',
        closeOnEscape: true,
        modal: true,
        draggable: false,
        resizable: false,
        dialogClass: 'classification-dialog '+ dialogClass,
        close: function(event, ui) {
            var t = $(this);

            if(closeCallBack)
                closeCallBack.call(this, arguments);

            t.dialog('destroy');

            return false;
        },
        open: function(event, ui) {
            var t = $(this);
            var parr = t.parent();

            var closeA = $('<a href="javascript:;" class="closeDialog uiIcon _close" title="'+ self.i18n('Close') +'" />');
            
            $(closeA).on('click.a', function() {
                var closeback = $(this).data('closeback');
                var closeel = $(this).data('closeel');
                
                if(closeback) {
                    var rnp = closeback(closeel);
                    
                    $(this).removeData('closeel');

                    if(rnp)
                        return;
                }

                t.dialog('close');
            });
            
            $('.ui-dialog-titlebar', parr).append(closeA);
            
            $('button.closeDialog', t).on('click.b', function() {

                t.dialog('close');
            });

            
            $('form', t).data('parentDialog', t);
            
            t.on('recenterPercent', function(cuEv, data){
                var data = data || {};

                if(data.centered)
                    t.dialog('option', 'position', {my: 'center', at: 'center', of: window});

                var topLeft = posPer(parr);

                parr.css({
                    top: topLeft.top +'vh',
                    left: topLeft.left +'vw'
                });

                $('.middle-dia-content', t).on('scroll', function () {

                    if(window.WebuiPopovers)
                        WebuiPopovers.hideAll();
                });
            });


            if(htmlSpinner)
                t.prepend(htmlSpinner);

            t.trigger('recenterPercent');

            if(openCallBack)
                openCallBack.call(this, arguments);


        }
    });

    $('.ui-widget-overlay').on('click', function() {
        if ($('.webui-popover:visible').length === 0) {
            dialog.dialog('close')
        }
    });


    
    return dialog;
};

/**
 * Создаёт всплывающее окно
 * @param params - объект с полями: className - класс будущего тултипа, target - куда кладём контейнер тултипа, content - что будет внутри контейнера,
 * eventType - тип событий для показа тултипа
 *
 * @returns {jQuery|HTMLElement} - jquery-объект тултипа
 */
Classification_Subsystem_Utilities.prototype.createTooltip = function (params) {
    var target = $(params.target) || $(document.body),
        tooltip = $('<div>', {'class': 'tooltip ' + (params.className || '')}),
        content = params.content || "",
        eventType = params.eventType || 'mouseenter';

    tooltip
        .append(content)
        .css('position', 'absolute');

    $('.tooltip ' + (params.className || ''), target).remove(); // delete possible duplicates

    target
        .css('position', 'relative')
        .append(tooltip);

    switch (eventType) {
        case 'mouseenter':
            target
                .on('mouseleave', function () {
                    tooltip.hide();
                })
                .on('mouseenter', function () {
                    tooltip.show();
                });
            break;
        case 'click':
            target
                .on('click', function () {
                    tooltip.toggle();

                    return false;
                });
            break;
    }


    return tooltip;
};

// https://stackoverflow.com/questions/16308037/detect-when-elements-within-a-scrollable-div-are-out-of-view
/*
Classification_Subsystem_Utilities.prototype.checkInView = function (c, el, partial) {
    var container = c[0];
    var element = el[0];
    
    //Get container properties
    var cTop = container.scrollTop;
    var cBottom = cTop + container.clientHeight;

    //Get element properties
    var eTop = element.offsetTop;
    var eBottom = eTop + element.clientHeight;

    //Check if in view    
    var isTotal = (eTop >= cTop && eBottom <= cBottom);

    var isPartial = partial && (
      (eTop < cTop && eBottom > cTop) ||
      (eBottom > cBottom && eTop < cBottom)
    );

    //Return outcome
    return  (isTotal  || isPartial);
};
*/
