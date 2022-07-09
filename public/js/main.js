'use strict';

/*
 * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Object/create
 * 
 */

if (typeof Object.create != 'function') {
  // Production steps of ECMA-262, Edition 5, 15.2.3.5
  // Reference: http://es5.github.io/#x15.2.3.5
  Object.create = (function() {
    // To save on memory, use a shared constructor
    function Temp() {}

    // make a safe reference to Object.prototype.hasOwnProperty
    var hasOwn = Object.prototype.hasOwnProperty;

    return function (O) {
      // 1. If Type(O) is not Object or Null throw a TypeError exception.
      if (typeof O != 'object') {
        throw TypeError('Object prototype may only be an Object or null');
      }

      // 2. Let obj be the result of creating a new object as if by the
      //    expression new Object() where Object is the standard built-in
      //    constructor with that name
      // 3. Set the [[Prototype]] internal property of obj to O.
      Temp.prototype = O;
      var obj = new Temp();
      Temp.prototype = null; // Let's not keep a stray reference to O...

      // 4. If the argument Properties is present and not undefined, add
      //    own properties to obj as if by calling the standard built-in
      //    function Object.defineProperties with arguments obj and
      //    Properties.
      if (arguments.length > 1) {
        // Object.defineProperties does ToObject on its first argument.
        var Properties = Object(arguments[1]);
        for (var prop in Properties) {
          if (hasOwn.call(Properties, prop)) {
            obj[prop] = Properties[prop];
          }
        }
      }

      // 5. Return obj
      return obj;
    };
  })();
}


function Classification_Subsystem_Utilities() {
}

function Classification_Subsystem_Tabs() {

    //Classification_Subsystem_Utilities.apply(this, arguments);
}

Classification_Subsystem_Utilities.prototype = Object.create(Classification_Subsystem_Tabs.prototype);

function Classification_Subsystem_History() {
}

Classification_Subsystem_History.prototype = Object.create(Classification_Subsystem_Utilities.prototype);

function Classification_Doc_Collections() {
}

Classification_Doc_Collections.prototype = Object.create(Classification_Subsystem_History.prototype);


function Client_Always_Execute(){
}

Client_Always_Execute.prototype = Object.create(Classification_Doc_Collections.prototype);

function Classification_Subsystem_Attribute_Search(){
}

Classification_Subsystem_Attribute_Search.prototype = Object.create(Client_Always_Execute.prototype);


function Classification_Subsystem_Reports_Fiter(){
}

Classification_Subsystem_Reports_Fiter.prototype = Object.create(Classification_Subsystem_Attribute_Search.prototype);


function Classification_Subsystem_ReadyMade(){
}

Classification_Subsystem_ReadyMade.prototype = Object.create(Classification_Subsystem_Reports_Fiter.prototype);


function Classification_Pan_Main(){
}
Classification_Pan_Main.prototype = Object.create(Classification_Subsystem_ReadyMade.prototype);


function Classification_Subsystem_Form_Analysis(){
}

Classification_Subsystem_Form_Analysis.prototype = Object.create(Classification_Pan_Main.prototype);


function Classification_Subsystem_Main() {
    this.currentAJAX = null;
    this.pluginKodObj = {};
    //this.jQueryDialog = null;
}

Classification_Subsystem_Main.prototype = Object.create(Classification_Subsystem_Form_Analysis.prototype);
Classification_Subsystem_Main.prototype.constructor = Classification_Subsystem_Main;
//
//


Classification_Subsystem_Attribute_Search.prototype.attributeSearchDialog = function(obj) {
    var self = this;
    var obj = obj || {};
    var obj = obj || {};
    var title = obj.title;
    var htmlBody = obj.htmlBody;
    
    var clone = htmlBody.clone();

    var workForm = $('form.attribute-search', clone);
        workForm.prop('name', 'attribute-search');


    self.sybmitFormAttributeSearch({
        form: workForm
    });


    var closeCallBack = function() {
        var t = $(this);
        var nohis = t.data('nohistory');

        if(nohis)
            return;

        if(history.length > 2)
            return history.back();

        var url = self.pluginKodObj['siteUrl'];

        $(window).trigger('loadAjaxData', {'href': url});
    };

    self.openjQueryDialog({
        title: title,
        dialogClass: 'attribute-search-dialog',
        htmlBody: clone,
        
        closeCallBack: closeCallBack
    });

    $.datepicker.setDefaults( $.datepicker.regional[ "ru" ] );
    $( ".dtp" ).datepicker();

    jQuery( '.classif-list' ).click( function() {
        return false;
    });
    jQuery( '.classif-it' ).click( function( e ) {
        var next = jQuery( this ).next();
        next.slideDown( 400, 'swing', function() { next.addClass( 'opened' ); } );
    });
    jQuery( '.ui-dialog, .ui-widget-overlay' ).click( function() {
        jQuery( '.classif-list.opened' ).slideUp();
        jQuery( '.opened' ).removeClass( 'opened' );
    });
    jQuery( '.cllogic' ).change( function() {
        var parent = $( this ).parent();
        var txts = [];
        var ids = [];
        var separ = $( this ).find( 'option:selected' ).text();
        parent.find( '.classif-list' ).find( 'li' ).each( function() {
            if ( jQuery( this ).hasClass( 'active-c' ) ) {
                txts.push( jQuery( this ).text() );
                ids.push( jQuery( this ).attr( 'cid' ) );
            }
        });
        parent.find( 'input.it:first' ).val( txts.join( ' ' + separ + ' ' ) );
        parent.find( 'input[type="hidden"]' ).val( ids.join( ',' ) );
    });
    jQuery( '.datemode' ).change( function() {
        var parent = $( this ).parent();
        var pref = parent.find( '.date-pref' );
        var start = parent.find( '.start-date' );
        var end = parent.find( '.end-date' );
        pref.hide();
        start.show();
        end.show();
        switch( $( this ).val() ) {
            case '0':
            case '2':
                end.hide();
                break;
            case '1':
                start.hide();
                break;
            case '3':
            case '4':
                pref.show();
        }
    });
    jQuery( '.classif-list li' ).click( function() {
        if ( $( this ).hasClass( 'active-c' ) )
            $( this ).removeClass( 'active-c' );
        else
            $( this ).addClass( 'active-c' );
        var ul = $( this ).closest( 'ul' );
        var parent = ul.parent();
        var txts = [];
        var ids = [];
        var separ = parent.find( 'select:first option:selected' ).text();
        ul.find( 'li' ).each( function() {
            if ( jQuery( this ).hasClass( 'active-c' ) ) {
                txts.push( jQuery( this ).text() );
                ids.push( jQuery( this ).attr( 'cid' ) );
            }
        });
        parent.find( 'input.it:first' ).val( txts.join( ' ' + separ + ' ' ) );
        parent.find( 'input[type="hidden"]' ).val( ids.join( ',' ) );
    });
    jQuery( '.dtp' ).change( function() {
        var datas = [];
        $( this ).parent().parent().find( '.dtp' ).each( function() {
            datas.push( $( this ).val() );
        });
        $( this ).parent().parent().find( 'input:last' ).val( datas.join( ',' ) );
    });
};

Classification_Doc_Collections.prototype.sybmitFormAttributeSearch = function(obj) {
    var self = this;
    var obj = obj || {};
    var form = obj['form'];
    var insertNode = obj['insertNode'];
    
    $(form).submit(function(event){
        event.preventDefault ? event.preventDefault() : (event.returnValue = false);

        var jqForm = $(this);
        var submitBut = $('button[type="submit"]', jqForm);
            submitBut.prop('disabled', true);

        var attrAction = jqForm.attr('action');
        var parentDialog = jqForm.data('parentDialog');

/*      Не удалять, нужно
        jqForm.trigger('form-check', {startSubmit: true});
        
        var invalid = $('.__invalid', jqForm);

        if(invalid.length) {

            submitBut.removeAttr('disabled');
            return false;
        }
*/

        var sendAjData = jqForm.serializeArray();

        if((!sendAjData) || (sendAjData.length < 1))
            return false;

        if(self.AJAXProcess != null)
            self.AJAXProcess.abort();

        self.AJAXProcess = $.ajax({
            url: attrAction,
            type: 'GET',
            data: sendAjData,
            dataType : 'json',
            timeout: 240000,
            error: self.ajaxError,
            complete: function(){
                
                window.setTimeout(function(){
                    
                    submitBut.prop('disabled', false);
                }, 1000);
            },
            success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;
                
                if(data.error) { //Временно
                    
                    alert(data.error);
                    return;
                }               

                if(!data.listid)
                    return;

                if(parentDialog) {

                    parentDialog.data('nohistory', true);
                    parentDialog.dialog('close');
                }
                

                var url = self.pluginKodObj['siteUrl'] +'attribute-search?listid='+ data.listid;
                if(data.pan) url = self.pluginKodObj['siteUrl'] +'pan/attribute-search?listid='+ data.listid;

                $(window).trigger('loadAjaxData', {'href': url});
            }
        });
        
        
    });

};//
//

Classification_Subsystem_Main.prototype.init = function() {
    var self = this;

    /*
     * 
     * Позволяет получить URL в случае error
     */
    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {

        jqXHR.url = options.url;
    });

    /*
     * 
     * Конвертер размера шрифта px/em согласно наследования от родителя
     */
    self.pxemjQuery();
    
    /*
     * 
     */
    
    self.datepickerRu();
    
    /*
     * 
     */
    self.jQueryAddContains();


    self.headerTopLogged();
};

Classification_Subsystem_Main.prototype.headerTopLogged = function() {
    var self = this;
    var mB = $('body .wrapper .header .header_top_logged');
    var allUl = $('ul', mB);
    var clEl = $('ul + a', mB);

    clEl.click(function(){
        var a = $(this);
        var usrCl = a.hasClass('__user');
        var ul = a.prev();

        ul.fadeToggle({
            duration: 'fast',
            complete: function() {
                var itn = $(this);
                var isVis = itn.is(":visible");

                itn.toggleClass('__visible', isVis);
                itn.removeAttr('style');

                if(!isVis && usrCl)
                    allUl.removeClass('__visible');
            }
        });

        return false;
    });

    allUl.click(function(e){
        var targ = $(e.target);
        var fedva = allUl.filter('.__visible');

        fedva.fadeOut({
            complete: function() {
                var itn = $(this);
                itn.removeClass('__visible');
                itn.removeAttr('style');
            }
        });
        
        if(!targ.is('a'))
            return false;

    });
};

Classification_Subsystem_Main.prototype.pxemjQuery = function() {
    var self = this;

    //https://raw.githubusercontent.com/arasbm/jQuery-Pixel-Em-Converter/master/pxem.jQuery.js

    /*-------------------------------------------------------------------- 
     * jQuery pixel/em conversion plugins: toEm() and toPx()
     * by Scott Jehl (scott@filamentgroup.com), http://www.filamentgroup.com
     * Copyright (c) Filament Group
     * Dual licensed under the MIT (filamentgroup.com/examples/mit-license.txt) or GPL (filamentgroup.com/examples/gpl-license.txt) licenses.
     * Article: http://www.filamentgroup.com/lab/update_jquery_plugin_for_retaining_scalable_interfaces_with_pixel_to_em_con/
     * Options:  	 								
                    scope: string or jQuery selector for font-size scoping		  
     * Usage Example: $(myPixelValue).toEm(); or $(myEmValue).toPx();
    --------------------------------------------------------------------*/

    $.fn.toEm = function(settings){
        
        settings = jQuery.extend({
            scope: 'body'
        }, settings);
        
        var that = parseInt(this[0],10),
            scopeTest = jQuery('<span style="display: none; font-size: inherit; line-height: 1;">&nbsp;</span>').appendTo(settings.scope),
            scopeVal = scopeTest.height();
        
        scopeTest.remove();
        
        return (that / scopeVal).toFixed(4) + 'em'; //8
    };

    $.fn.toPx = function(settings){
        
        settings = jQuery.extend({
            scope: 'body'
        }, settings);
        
        var that = parseFloat(this[0]),
            scopeTest = jQuery('<span style="display: none; font-size: inherit; line-height: 1;">&nbsp;</span>').appendTo(settings.scope),
            scopeVal = scopeTest.height();
    
        scopeTest.remove();
        
        return Math.round(that * scopeVal) + 'px';
    };
};


Classification_Subsystem_Main.prototype.datepickerRu = function() {
    /* Russian (UTF-8) initialisation for the jQuery UI date picker plugin. */
    /* Written by Andrew Stromnov (stromnov@gmail.com). */
    ( function( factory ) {
            if ( typeof define === "function" && define.amd ) {

                    // AMD. Register as an anonymous module.
                    define( [ "../widgets/datepicker" ], factory );
            } else {

                    // Browser globals
                    factory( jQuery.datepicker );
            }
    }( function( datepicker ) {

    datepicker.regional.ru = {
            closeText: "Закрыть",
            prevText: "&#x3C;Пред",
            nextText: "След&#x3E;",
            currentText: "Сегодня",
            monthNames: [ "Январь","Февраль","Март","Апрель","Май","Июнь",
            "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь" ],
            monthNamesShort: [ "Янв","Фев","Мар","Апр","Май","Июн",
            "Июл","Авг","Сен","Окт","Ноя","Дек" ],
            dayNames: [ "воскресенье","понедельник","вторник","среда","четверг","пятница","суббота" ],
            dayNamesShort: [ "вск","пнд","втр","срд","чтв","птн","сбт" ],
            dayNamesMin: [ "Вс","Пн","Вт","Ср","Чт","Пт","Сб" ],
            weekHeader: "Нед",
            dateFormat: "dd.mm.yy",
            firstDay: 1,
            isRTL: false,
            showMonthAfterYear: false,
            yearSuffix: "" };
    datepicker.setDefaults( datepicker.regional.ru );

    return datepicker.regional.ru;

    } ) );
};

Classification_Subsystem_Main.prototype.jQueryAddContains = function() {
    var self = this;
    
    jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function(arg) {

        return function( elem ) {
            return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });
};

Classification_Subsystem_Main.prototype.tabsShowHide = function() {
    var self = this;

    //<a href="{{siteConf 'url'}}list-docs/" class="intab-a __js-tabs-i" data-xhr="1" data-open-tab="id-0">

    return;

    $('.__js-tabs-i').click(function(event) {

        event.preventDefault ? event.preventDefault() : (event.returnValue = false);

        var el = $(this);
        var attrOpenTab = el.data('open-tab');

        var parr = el.parents('.tabs[data-link-tabs]');
        var attrLinkTabs = parr.data('link-tabs');

        if(!attrLinkTabs)
            return;

        var grpTabs = $('.group-page-tabs[data-group-tabs="'+ attrLinkTabs +'"]');
        var attrGroupTabs = grpTabs.data('group-tabs');

        if(grpTabs.length < 1) {

            var siteUrl = self.plugGlobVar['siteUrl'];

            /*
            * Не забудь удалить!
            */
            if(siteUrl) {

                window.location.href = siteUrl;
            }

            return;
        }

        var needOpenTab = $('[data-tab-id="'+ attrOpenTab +'"]', grpTabs);

        if(needOpenTab.length < 1)
            return;


        $('.__active', parr).removeClass('__active');


        $('.tab-itm.__active', grpTabs).each(function(){
            var ciItm = $(this);
            var ciParr = ciItm.parents('.group-page-tabs');

            if(ciParr.data('group-tabs') != attrGroupTabs)
                return;

            ciItm.removeClass('__active');
        });

        el.addClass('__active');

        needOpenTab.fadeIn({
            'complete': function() {
                var itn = $(this);
                    itn.addClass('__active');
                    itn.removeAttr('style');
            }
        });

        // data-link-tabs="grp-t" >> data-group-tabs="grp-t"
        // data-open-tab="id-0" >> data-tab-id

        return false;

        var tab = $(this).attr('id'),
            //btns = $('.relative-tab'), //Кнопка
            targetBtn = '.' + tab;

        $('.__js-tabs-i').removeClass('__active').eq($(this).index()).addClass('__active');
        $(".__js-tabs-cnt").hide().eq($(this).index()).fadeIn();

        //btns.removeClass('__active');

        $(targetBtn).addClass('__active');
    });

    //.eq(0).addClass('__active');
    //$(".__js-tabs-cnt").eq(0).show();

    /*
    $('.__js-check-stroke').click(function() {
        if ($(this).hasClass('__active')) {
            $(this).removeClass('__active');
            $('.draft').addClass('__disabled');
        }
        else{
            $('.__js-check-stroke').removeClass('__active').eq($(this).index()).addClass('__active');
            $('.draft').removeClass('__disabled');
        }
        return false;
    })

    $('.check-stroke').click(function() {
        if ($(this).hasClass('__active')) {
            $(this).removeClass('__active');
            $('.template').addClass('__disabled');
        }
        else{
            $('.check-stroke').removeClass('__active').eq($(this).index()).addClass('__active');
            $('.template').removeClass('__disabled');
        }
        return false;
    })
    */
};

//
//

Client_Always_Execute.prototype.setDocumentTitle = function(title) {
    var self = this;
    var serviceName = self.i18n('serviceName');

    document.title = title || serviceName;
};

Client_Always_Execute.prototype.showHideTopMenu = function(evr) {
    var self = this;
    var topMenu = $('.wrapper .bg_pattern .main-cnt .top-menu');
    
    var bu = evr === 'true';
    var isVis = topMenu.hasClass('__hidden');
    var func = isVis ? topMenu.fadeIn : topMenu.fadeOut;
    
    if((bu && isVis) || (!bu && !isVis))
        return;

    var parr = {
        complete: function() {
            var itn = $(this);
            
            itn.toggleClass('__hidden');
            
            itn.removeAttr('style');
    }};
    
    func.call(topMenu, parr);
};/**
 * Режим просмотра требований/группировка текста требования #20444
 * @param main
 * @constructor
 */
function DemandView(main) {
    var self = this;
    this.main = main;
    this.containers = $('.view-mode');
    this.kdocContainer = $('.form-analysis-text-doc');
    this.currentMode = 1;

    this.containers.each(function () { self.init(this); });
}

/**
 * Иницилиазирует модуль
 * @param {HTMLElement} element
 */
DemandView.prototype.init = function (element) {
    var tooltip = this.main.createTooltip({target: $('.view-mode__icon', $(element)), content: $('.pieces-tmpl .template-view-mode').clone(), className: 'view-mode__tooltip', eventType: 'click'}),
        self = this;

    tooltip.on('click', 'li', function () {
        var $elem = $(this),
            mode = $elem.attr('data-mode');

        tooltip.hide();

        self.setMode(parseInt(mode));

        return false;
    });

    this.kdocContainer.on('click', function (e) {
       self.setMode(1);
    });
};


/**
 * Скрывает элемент управления режимами просмотра "глазик"
 */
DemandView.prototype.off = function () {
    this.containers.removeClass('view-mode_active');
    this.setMode(1);
};


/**
 * Показывает элемент управления режимами просмотра "глазик"
 */
DemandView.prototype.on = function () {
    this.containers.addClass('view-mode_active');
};


/**
 * Устанавливат режим отображения
 * @param mode - число режима отображения 1- видно всё, 2- только текст требования видно
 */
DemandView.prototype.setMode = function (mode) {
    this.currentMode = mode;
    this.containers.find('[data-mode]').removeClass('view-mode__item_active');
    this.containers.find('[data-mode=' + mode + ']').addClass('view-mode__item_active');

    switch (mode) {
        case 1:
            this.kdocContainer.removeClass('show-only-demand-text');
            break;
        case 2:
            this.kdocContainer.addClass('show-only-demand-text');
            break;
    }
};
//
//

Classification_Doc_Collections.prototype.addSaveCollections = function(obj) {
    var self = this;
    var obj = obj || {};
    var form = obj['form'];
    var insertNode = obj['insertNode'];
    
    $(form).submit(function(event){

        event.preventDefault ? event.preventDefault() : (event.returnValue = false);

        var jqForm = $(this);
        var submitBut = $('button[type="submit"]', jqForm);
            submitBut.attr('disabled', true);

        var attrAction = jqForm.attr('action');
        var parentDialog = jqForm.data('parentDialog');


        jqForm.trigger('form-check', {startSubmit: true});
        
        var invalid = $('.__invalid', jqForm);

        if(invalid.length > 0) {

            submitBut.removeAttr('disabled');
            return false;
        }


        var sendAjData = jqForm.serializeArray();

        if((!sendAjData) || (sendAjData.length < 1))
            return false;

        if(self.AJAXProcess != null)
            self.AJAXProcess.abort();

        self.AJAXProcess = $.ajax({
            url: attrAction,
            type: 'POST',
            data: sendAjData,
            dataType : 'json',
            error: self.ajaxError,
            complete: function(){

                window.setTimeout(function(){
                    
                    //submitBut.removeAttr('disabled');
                }, 1000);
            },
            success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;

                if(parentDialog)
                    parentDialog.dialog('close');

                if(data.html) {

                    var jqHTML = $(data.html);
                        jqHTML.hide();

                    var toItmEven = $('a[data-xhr-tabs]', jqHTML);

                    self.eventAddLoad({
                        'els': toItmEven
                    });

                    if(data.replace) {

                        var findRepl = $('a[data-id="'+ data.id +'"]', insertNode).parents('.colle-list-li');

                        $(findRepl).replaceWith(jqHTML);

                    } else {
                        
                        insertNode.append(jqHTML);
                        
                        var liLast = $('li:last', insertNode);

                            liLast.fadeIn({
                                start: function(){
                                    
                                    insertNode.scrollTo(liLast);
                                }
                            });
                    }
                    
                }

            }
        });
        
        
    });

};

Classification_Doc_Collections.prototype.removeCollections = function(obj) {
    var self = this;
    var obj = obj || {};

    var sendAjData = [
        {name: "remove", value: 1},
        {name: "name_collections", value: 'remove collection'}
    ];
    
    sendAjData.push({name: "id", value: obj.id});

    var url = self.pluginKodObj['siteUrl'];

    $.ajax({
        url: url +'add-remove-collections',
        type: 'POST',
        data: sendAjData,
        dataType : 'json',
        error: self.ajaxError,
        //complete: function(){},
        success: function(data, textStatus, jqXHR) {

            var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

            if(!emptyReply)
                return;

            $(window).trigger('loadAjaxData', {href: url, replaceState: true});
        }
    });
    
};

Classification_Doc_Collections.prototype.searchResultsKod = function(obj) {
    var self = this;
    var obj = obj || {};
    var form = obj['form'];
    //var insertNode = obj['insertNode'];
    
    $(form).submit(function(event){

        event.preventDefault ? event.preventDefault() : (event.returnValue = false);

        var jqForm = $(this);
        var submitBut = $('button[type="submit"]', jqForm);
            submitBut.attr('disabled', true);

        var attrAction = jqForm.attr('action');

        jqForm.trigger('form-check', {startSubmit: true});
        
        var invalid = $('.__invalid', jqForm);

        if(invalid.length > 0) {

            submitBut.removeAttr('disabled');
            return false;
        }

        var sendAjData = jqForm.serializeArray();

        if((!sendAjData) || (sendAjData.length < 1))
            return false;

        jqForm.addClass('search-process');


        var complete = function(){

            window.setTimeout(function(){

                submitBut.removeAttr('disabled');
                jqForm.removeClass('search-process');

            }, 1000);
        };


        if(self.AJAXProcess != null)
            self.AJAXProcess.abort();

        self.AJAXProcess = $.ajax({
            url: attrAction,
            type: 'GET',
            timeout: 240000,
            data: sendAjData,
            dataType : 'json',
            error: self.ajaxError,
            /*complete: function(){
                
                window.setTimeout(function(){
                    
                    submitBut.prop('disabled', false);
                }, 1000);
            },*/
            complete: complete,
            success: function(data, textStatus, jqXHR) {

                /*var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;
                
                if(data.error) { //Временно
                    
                    alert(data.error);
                    return;
                }               

                if(!data.listid)
                    return;

                if(parentDialog) {

                    parentDialog.data('nohistory', true);
                    parentDialog.dialog('close');
                }*/
                    
                var url = self.pluginKodObj['siteUrl'] +'attribute-search?listid='+ data.listid;

                $(window).trigger('loadAjaxData', {'href': url});
            }
            /*complete: complete,
            success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;

                var clb = function(data, textStatus, jqXHR){

                    var data = data || {};
                    var listid = data['listid'];

                    var url = self.pluginKodObj['siteUrl'] +'search-results-kod/?listid='+ listid;

                    $(window).trigger('loadAjaxData', {'href': url});
                };


                self.loadListResultsKod({
                    'callback': clb,
                    'complete': complete,
                    'dataSend': {
                        'docs': JSON.stringify(data)
                    }
                });

            }*/
        });
        
        
    });

};

Classification_Doc_Collections.prototype.loadListResultsKod = function(obj) {
    var self = this;
    var obj = obj || {};
    var callback = obj['callback'];
    var complete = obj['complete'];
    var dataSend = obj['dataSend'];
    //var form = obj['form'];
    
   if(self.AJAXProcess != null)
        self.AJAXProcess.abort();

    var sendAjData = {
        m: 1
    };
    
    if(dataSend)
        $.extend(sendAjData, dataSend);

    self.AJAXProcess = $.ajax({
        url: self.pluginKodObj['siteUrl'] +'search-results-kod/',
        type: 'POST',
        data: sendAjData,
        dataType : 'json',
        error: self.ajaxError,
        complete: complete,
        success: callback
    });
    
};

Classification_Doc_Collections.prototype.listEvents = function(obj) {
    var self = this;
    var obj = obj || {};
    var el = $(obj['el']);
    
    if(el.length < 1)
        return;
    
    var expandChild = function(event) {
        var t = $(this);
        var targ = $(event.target);
        
        if(targ.length < 1)
            return false;

        var ul = targ.prev();
        var isVis = ul.hasClass('__visible');
        var allUl = $('.doc-list-tools-itm ul.__visible', t);
        
        allUl.removeClass('__visible');
        
        if(isVis)
            return;

        ul.fadeIn({
            duration: 'fast',
            complete: function() {
                var itn = $(this);

                itn.addClass('__visible');
                itn.removeAttr('style');

            }
        });
        
        return false;
    };
    
    var toFolder = function(event){
        var t = $(this);
        var targ = $(event.target);
        
        if(targ.length < 1)
            return false;
        
        var dis = targ.data('disabled');

        if(dis)
            return;

        targ.data('disabled', true);
        
        window.setTimeout(function(){

            targ.removeData('disabled', true);
        }, 2000);

        var nd = targ.data('addit-nd');
        //var parr = targ.parents('li.doc-list-li');
        //var name = $('.annot-name', parr).html();

        var docs = [nd];

        var andExp = targ.hasClass('and-exp');
        
        if(!andExp) {

            self.addRemoveDocsForAnalysis({
                 sendData: {docs: docs}
                ,success: function() {

                    targ.parent().remove();
                }
            });

            return;
        }


        self.openjQueryDialog({
            title: self.i18n('Appoint experts'),
            spinner: true,
            dialogClass: '__use-select-none',
            openCallBack: function() {
                var initDialog = $(this);
                
                self.appointLoadExperts({
                    nd: nd,
                    success: function(/*data, textStatus, jqXHR*/){

                        var dataHtml = $(arguments[0]);
                            dataHtml.data('parentDialog', initDialog);
                            dataHtml.css('opacity', 0);

                        window.setTimeout(function(){
                            
                            initDialog.html(dataHtml);
                            initDialog.trigger('recenterPercent', {centered: true});
                            
                            var dialogForm = $('form', initDialog);
                                dialogForm.animate({opacity: 1});
                        }, 1000);

                    }
                });
            }
        });

    };
    
    var toRemove = function(event) {
        var t = $(this);
        var targ = $(event.target);

        if(targ.length < 1)
            return false;

        var docList = targ.parents('div.doc-list');

        var nd = targ.data('addit-nd');
        var listId = docList.data('list-id');
        
        if((!listId) || (!nd))
            return;
        
        var sendAjData = {
            collection_id: listId,
            nd: nd,
            action: 'del'
        };

        self.addRemoveDocsToCollections({
            sendAjData: sendAjData,
            success: function(data){
                
                if(!data.ok)
                    return;
                
                var url = location.pathname +''+ location.search;

                $(window).trigger('loadAjaxData', {href: url, replaceState: true});
            }
        });
    };

    el.click(function(e){
        var t = $(this);
        var targ = $(e.target);

        if(targ.hasClass('expand-child')) {

            return expandChild.call(this, e);
        }

        if(targ.hasClass('to-folder')) {

            var tof = toFolder.call(this, e);

            if(tof)
                return tof;
        }

        if(targ.hasClass('remove')) {

            toRemove.call(this, e);
        }

        $('.__visible', t).removeClass('__visible');
    });

};

Classification_Doc_Collections.prototype.addRemoveDocsForAnalysis = function(obj) {
    var self = this;
    var obj = obj || {};
    var success = obj['success'];
    var complete = obj['complete'];
    var sendData = obj['sendData'];

    $.ajax({
        url: self.pluginKodObj['siteUrl'] +'add-docs-analysis',
        type: 'POST',
        data: sendData,
        dataType : 'json',
        error: self.ajaxError,
        complete: function(){

            if(complete)
                complete.apply(self, Array.prototype.slice.call(arguments));
        },
        success: function(data, textStatus, jqXHR) {

            var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

            if(!emptyReply)
                return;

            if(!data['ok'])
                return;

            if(success)
                success.apply(self, Array.prototype.slice.call(arguments));
        }
    });

};

Classification_Doc_Collections.prototype.appointLoadExperts = function(obj) {
    var self = this;
    var obj = obj || {};
    var el = obj['el'];
    var success = obj['success'];
    var complete = obj['complete'];
    //var parr = obj['parr'];
    var nd = obj.nd;

    var sendAjData = {
        nd: nd
    };

    $.ajax({
        url: self.pluginKodObj['siteUrl'] +'users-list',
        type: 'GET',
        data: sendAjData,
        dataType : 'HTML',
        error: self.ajaxError,
        complete: function(){

        },
        success: function(data, textStatus, jqXHR) {

            var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

            if(!emptyReply)
                return;

            if(success)
                success.apply(self, Array.prototype.slice.call(arguments));
        }
    });
    
};

Classification_Doc_Collections.prototype.appointExpertsForm = function(obj) {
    var self = this;
    var obj = obj || {};
    var form = obj['form'];
    var insertNode = obj['insertNode'];
    
    $(form).submit(function(event){

        event.preventDefault ? event.preventDefault() : (event.returnValue = false);

        var jqForm = $(this);
        var submitBut = $('button[type="submit"]', jqForm);
            submitBut.attr('disabled', true);

        var attrAction = jqForm.attr('action');
        var parentDialog = jqForm.data('parentDialog');

        var sendAjData = jqForm.serializeArray();

        if((!sendAjData) || (sendAjData.length < 1))
            return false;


        self.addRemoveDocsForAnalysis({
             sendData: sendAjData
            ,success: function() {
                
                var docList = $('.doc-list');

                sendAjData.forEach(function(curVal){

                    if(curVal.name !== 'docs[]')
                        return;
                    
                    if(!curVal.value)
                        return;
                    
                    var noExp = $('a.no-exp[data-addit-nd="'+ curVal.value +'"]', docList);
                    
                    if(noExp.length > 0)
                        noExp.parent().remove();
                });
                
                if(parentDialog)
                    parentDialog.dialog('close');

            }
        });

    });

};


Classification_Doc_Collections.prototype.docDraggableDroppable = function(obj) {
    var self = this;
    var obj = obj || {};
    var el = obj['el'];

    var liDrag = $('.doc-list .doc-list-ul .doc-list-li[data-lid-doc]', el);
    
    var liDropSelector = '.doc-collections .list-collections .no-service-collect[data-id-coll]';
    var liDrop = $(liDropSelector, el);


    var dragicon = $('.__hidden .pieces-tmpl .doc-dragging-icon').clone();

    liDrag.draggable({
        containment: el
        ,disabled: true
        //,cursor: 'grabbing' //grab
        //,scope: 'docs'
        ,cursorAt: {
            left: -6,
            top: 0
        }
        ,helper: function() {
            var c = liDrag.filter('.selected');

            $('.count-docs', dragicon).text((c.length < 2 ? '' : c.length));

            return dragicon;
        }
        ,start: function(){
            
            var checkLiDrop = $(liDropSelector, el);

            if(liDrop.length != checkLiDrop.length) {
                
                liDrop = checkLiDrop;
                
                attacheDroppable();
            }

            liDrop.droppable('enable');
        }
        ,stop: function(){
            
            liDrop.droppable('disable');
            
            window.setTimeout(function(){
                
                $('body').removeAttr('style');
            }, 100);
        }
    });
    

    liDrag.click(function(event){
        var currEl = $(this);
        var ctrlKey = event.ctrlKey;
        var shiftKey = event.shiftKey;
        
        if(!ctrlKey) {

            liDrag.removeClass('selected');
            liDrag.draggable('disable');
            return;
        }

        currEl.toggleClass('selected');
        currEl.draggable( currEl.hasClass('selected') ? 'enable' : 'disable');
    });


    var attacheDroppable = function() {
        
        try {

            liDrop.draggable('destroy');
        } catch(e){}
        
        liDrop.droppable({
            disabled: true
            ,tolerance: 'pointer'
            //,accept: 'docs'
            ,drop: function(event, ui){
                var currIn = $(this);
                var collection_id = currIn.data('id-coll');
                //var draggable = ui.draggable;
                //var helper = ui.helper;
                
                if(!collection_id)
                    return;

                var c = liDrag.filter('.selected');

                if(c.length < 1)
                    return;

                var arrId = [];

                c.each(function(){
                    var p = $(this);
                    var id = p.data('lid-doc');

                    arrId.push(id);
                });

                if(arrId.length < 1)
                    return;

                self.addRemoveDocsToCollections({
                    el: currIn
                    ,sendAjData: {
                        id: arrId
                        ,action: 'add'
                        ,collection_id: collection_id
                    }
                });

            }
        });
    };

    attacheDroppable();
};

Classification_Doc_Collections.prototype.addRemoveDocsToCollections = function(obj) {
    var self = this;
    var obj = obj || {};
    var el = obj['el'] || $();
    var sendAjData = obj['sendAjData'];
    var success = obj.success;

    $.ajax({
        url: self.pluginKodObj['siteUrl'] +'add-remove-docs-to-collections',
        type: 'POST',
        data: sendAjData,
        dataType : 'json',
        error: self.ajaxError,
        //complete: function(){},
        success: function(data, textStatus, jqXHR) {

            var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

            if(!emptyReply)
                return;
            
            if(success)
                success.apply(self, Array.prototype.slice.call(arguments));

            if(el.length > 0)
                $('.count-docs', el).html(data.length > 0 ? '('+ data.length +')' : '');
        }
    });

};

Classification_Doc_Collections.prototype.newFolderDialog = function(obj) {
    var self = this;
    var obj = obj || {};
    var title = obj.title;
    var insertNode = obj.insertNode;

    var clone = $('.pieces-tmpl .template-new-folder').clone();
        clone.removeClass('template-new-folder');

    var workForm = $('form.new-collections', clone);
        workForm.prop('name', 'new-collections');

    self.placeholderEmulation({
        els: $('input[placeholder]', workForm)
    });


    self.hotValidInput({
        form: workForm
    });


    self.addSaveCollections({
        form: workForm,
        insertNode: insertNode
    });


    self.openjQueryDialog({
        title: title,
        htmlBody: clone
    });
};//
//

Classification_Subsystem_Form_Analysis.prototype.classifierItemsWork = function(obj) {
    var self = this;
    var obj = obj || {};
    var context = $(obj['context']);

    $('a.have-children', context).click(function(e){
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);

        var el = $(this);
        var nU = el.next('ul');
        
        
        nU.slideToggle({
            start: function() {
                
                el.toggleClass('__active');
            }
        });
    });

};

Classification_Subsystem_Form_Analysis.prototype.prePendDataCheck = function(obj) {
    var self = this;
    var obj = obj || {};
    var othClass = obj.classes;
    
    var arrPids = obj['arrPids'] || [];
    
    for(var i = 0; i < arrPids.length; i++) {
        var pid = arrPids[i];

        var s = ('.form-analysis-text-doc p[data-pid="'+ pid +'"]');

        var el = document.querySelector(s);

        if(!el)
            continue;
        
        var cls = othClass ? othClass : 'is-checked';

        $(el).addClass(cls);
    }
};

Classification_Subsystem_Form_Analysis.prototype.unPendDataCheck = function(obj) {
    var self = this;
    var obj = obj || {};
    var othClass = obj.classes;
    
    var arrPids = obj['arrPids'] || [];
    
    for(var i = 0; i < arrPids.length; i++) {
        var pid = arrPids[i];

        var s = ('.form-analysis-text-doc p[data-pid="'+ pid +'"]');

        var el = document.querySelector(s);

        if(!el)
            continue;
        
        var cls = othClass ? othClass : 'is-checked';

        $(el).removeClass(cls);
    }
};


/*
 * Временно!
 */

Classification_Doc_Collections.prototype.pidsToText = function(obj) {
    var self = this;
    var obj = obj || {};
    
    var fo = $(document.forms['demand-into-parts']);
    
    var startSpin = self.spinnerPreLoadTabs();

    var sendAjData = fo.serializeArray();
    var dataPids = $('.form-analysis-text-doc p[data-pid].is-checked');

    dataPids.each(function(i){
        var itm = $(this);
        var pid = itm.data('pid');
        var sText = $.trim( itm.text() );
            sText = sText.replace(/\r|\n|/g, '').replace(/ {2,}/g, ' ');

        var textInfo = null;
        var isImg = $('img', itm);
        var isTd = $(itm).parent().is('td');

        if(isImg.length > 0 || isTd)
            textInfo = {};

        if(isImg.length > 0)
            textInfo.img = true;

        if(isTd)
            textInfo.td = true;

        sendAjData.push({name: 'pidstext[]['+ i +'][pid]', value: pid});
        sendAjData.push({name: 'pidstext[]['+ i +'][text]', value: sText});
        
        sendAjData.push({name: 'pidstext[]['+ i +'][info]', value: JSON.stringify(textInfo)});
    });


    if(self.AJAXProcess != null)
        self.AJAXProcess.abort();

    self.AJAXProcess = $.ajax({
        url: 'pids-to-text',
        type: 'POST',
        data: sendAjData,
        dataType : 'json',
        error: self.ajaxError,
        complete: function(){

            window.setTimeout(function(){
                
                startSpin.click();
            }, 800);
        },
        success: function(data, textStatus, jqXHR) {

            var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

            if(!emptyReply)
                return;

        }
    });

};
// Временно

Classification_Doc_Collections.prototype.kdocViewer = function(obj) {
    var self = this;
    var obj = obj || {};
    var nd = obj.nd;
    var target = obj.target;
    var vt = self.pluginKodObj.VDirInfo.PreferredVDir;
        vt = vt.replace(/\//g, '');

    var params = {};
        params.uuid = "-!"+ vt +"!-.-!"+ nd +"!-";
        params.url = '/kdocapi';
        params.mode = 'viewer';
        params.target = target;

        params.tocVisible = true;

    var ckC = new window.kdocClient();
        ckC.addListener('pushstate', function(){});
        ckC.addListener('error', function(error) {

            if(!error)
                return;

            var msgErr = "kDoc\n";
                msgErr += error.message +"\n";
                msgErr += error.type +"\n";

            alert(msgErr);
        });
        ckC.addListener('ready', function(){
            
            var pids = $('#data-arr-pids').data('arr-pids');

            window.setTimeout(function(){

                self.prePendDataCheck({arrPids: pids});

                // Временно
                //
                var pidsToText = $('.form-analysis .top-po-pp .pids-to-text');
                    pidsToText.click(function(){ self.pidsToText(); });
                    pidsToText.css('display', 'inline-block');

            }, 500);
            
        });
        ckC.open(params);
};

Classification_Doc_Collections.prototype.workTextDoc = function(obj) {
    var self = this;
    var obj = obj || {};
    var mB = $(obj.mB);
    var editing = obj['editing'] == 'true' || false;
    var btnPaoDis = obj['btnPaoDis'] == 'true' || false;

    var fo = $(document.forms['demand-into-parts']);
    var insertNode = $('input[name="selectedpid"]', fo);
    var foSubmit = $('button[type="submit"]', fo);
    
    var textDoc = $('.form-analysis-text-doc', mB);
    
    var stage1 = $('.doc-analysis-stage-1', mB);
    var listDemand = $('.in-l-demand .list-demand', stage1);
    
    var stage2 = $('.doc-analysis-stage-2', mB);
    var allClassifBl = $('.parent-blk-classificators', stage2);
    
    var readyMade = $('.ready-bt-made', mB);
    var modalReadMade = $('.pr-st', readyMade);

    var classifDemand = $(document.forms['save-current-classif']);
    
    var submitClassifFo = $(document.forms['submit-classification']);
    
    var listBroom = $('.mode-o-broom .rm-list-ul', mB);
    

    // Форма передачи/возврата согласования
    $('button[type="submit"]', submitClassifFo).prop('disabled', btnPaoDis);


    if(editing) {

        self.hotValidInput({
            form: fo
        });

        self.hotValidInput({
            form: classifDemand
        });

        /*
         * Событие на input вставка в value как массив
         */
        self.valToArray({
            els: insertNode
        });

        insertNode.on('addRemovePids', function(){
            var cinp = $(this);
            var val = cinp.val();
            var isVal = (val !== '');

            stage1.toggleClass('what-show-1', isVal);
        });
    }

    fo.on('partial-reset', function(){
        var el = $(this);

        $('input[name="id_demand"]', el).prop('value', null);
        $('input[name="selectedpid"]', el).prop('value', null);

        foSubmit.prop('disabled', true);
        foSubmit.removeClass('edit-go-dem');
    });

    if(editing)
    $('.edit-requirement', stage1).click(function(){
        var el = $(this);
        var nename = el.hasClass('nename');
        
        if(!nename) {

            foSubmit.addClass('edit-go-dem');
            stage1.removeClass('what-show-2').addClass('what-show-1');
        }

        textDoc.addClass('edit-t-demand');

        var aSel = $('.selected', listDemand);
        var datapid = aSel.data('pid-demand');
        var dataiddemand = aSel.data('id-demand');
        
        $('input[name="id_demand"]', fo).prop('value', dataiddemand);

        insertNode.trigger('addRemovePids', {pid: datapid, add: true});

        self.demandView.setMode(1);
        
        if(!nename)
            return;
        
        var clone = $('.pieces-tmpl .template-strange-form').clone();
            clone.removeClass('template-strange-form');

        var workForm = $('form', clone);
            workForm.prop('name', 'requirements-name-f');

        self.hotValidInput({
            form: workForm
        });

        var gnd = $('input[name="name_demand"]', fo);
        var newgnd = $('input[name="def-name"]', workForm);

        $('input[name="def-name"]', workForm).prop('value', aSel.text());

        workForm.submit(function(event){

            event.preventDefault ? event.preventDefault() : (event.returnValue = false);

            var jqForm = $(this);
            var parentDialog = jqForm.data('parentDialog');

            gnd.prop('value', newgnd.val());

            fo.submit();

            if(parentDialog)
                parentDialog.dialog('close');

            gnd.prop('value', null);
        });

        self.openjQueryDialog({
             title: self.i18n('Requirements name')
            ,htmlBody: clone
        });
    });

    /*
     * Переделать на trigger с учётом "веников"
     */

    textDoc.click(function(e){
        var el = $(this);
        var shiftKey = e.shiftKey;
        var ctrlKey = e.ctrlKey;
        var editDemand = el.hasClass('edit-t-demand');
        var isBroom = mB.hasClass('mode-is-broom');
        //var isMake = el.hasClass('make-demand');

        if(isBroom)
            return;

        var ela = $(e.target);
        var elp = ela.is('p') ? ela : ela.parents('p');

        var dataPid = elp.data('pid');

        if(!dataPid)
            return;

        dataPid = parseInt(dataPid, 10);

        var isSelected = elp.hasClass('__selected');
        var isChecked = elp.hasClass('is-checked');
        
        var addPid = isSelected ? false : true;


        if(!editDemand && !shiftKey && !ctrlKey)
            listDemand.trigger('unSelectA');


        if(editing) {

            if(shiftKey) {
                
                el.trigger('select-shift', {elp: elp});
            } else {

                if(!ctrlKey && !editDemand)
                    fo.trigger('partial-reset');

                insertNode.trigger('addRemovePids' , {pid: dataPid, add: addPid});

                elp.toggleClass('__selected', addPid);
            }
        }

        if(
            isChecked &&
            !isSelected &&
            !shiftKey &&
            !ctrlKey
        )
            listDemand.trigger('selectDemandToPid', {pid: dataPid});
    });
    
    textDoc.on('select-shift', function(event, d){
        var el = $(this);
        var d = d || {};
        var elp = $(d.elp);
        var e = event;
        var allP = $('p[data-pid]', el);
        var isBroom = mB.hasClass('mode-is-broom');

        var firSel = $('.__selected', el).first();

        //
        // Кусок параши
        if(isBroom) {
            if(firSel.length < 1) {
                
                elp.addClass('__selected');

                return;
            }
        }

        var start = firSel.length > 0 ? allP.index(firSel) : 0;
        var end = allP.index(elp);
        
        var min = Math.min(start, end);
        var max = Math.max(start, end);

        var elJer = allP.slice(min, (max + 1));

        var larr = [];
        
        elJer.each(function(){
            var l = $(this);
            
            var dataPid = l.data('pid');
                dataPid = parseInt(dataPid, 10);

            larr.push(dataPid);
        });

        $(elJer).addClass('__selected');

        insertNode.trigger('addRemovePids' , {pid: larr, add: true});
    });
    
    listDemand.on('selectDemandToPid', function(e, data){
        var el = $(this);
        var a = $('a[data-pid-demand]', el);
        var datP = data.pid;
        
        var suitable = $();

        a.each(function(){
            var sA = $(this);
            var arrPid = sA.data('pid-demand') || [];
            
            var compar = arrPid.indexOf(datP) > -1;
            
            if(!compar)
                return;

            sA.addClass('many-dem-selected');
        });

        var fif = $('a.many-dem-selected', el).first();

        listDemand.scrollTo(fif, {duration: 480, axis: 'y'});
    });

    listDemand.on('click.selectA', function(event, data){
        var el = $(this);
        var e = event;
        var ela = $(e.target);
        var datapid = ela.data('pid-demand');
        var dataid = ela.data('id-demand');

        if(!ela.is('a'))
            return;

        var isSel = ela.hasClass('selected');
        var elaParr = ela.parent();
        
        el.trigger('unSelectA');

         if((isSel) || (!datapid))
            return;

        el.trigger('demand-editing');

        fo.trigger('partial-reset');

        ela.addClass('selected');
        
        el.trigger('loadClassif', {
            sendAjData: {
                id_demand: dataid,
                nd: $('input[name="nd"]', fo).val(),
                id: $('input[name="id"]', fo).val()
            }
        });

        self.prePendDataCheck({
            arrPids: datapid,
            classes: '__selected'
        });

        //ХЗ, позже проверить, удалить
        if(e.isTrigger)
            return;

        var fiPid = datapid.sort().slice(0, 1);
        var toscr = $('p[data-pid="'+ fiPid +'"]');

        var searchScroll = $('kdoc', textDoc).scrollParent();

        if(toscr.length > 0)
            searchScroll.scrollTo(toscr, {duration: 480, axis: 'y'});

       self.demandView.on();
    });

    listDemand.on('unSelectA', function(event, d){
        var el = $(this);
        var d = d || {};
        var e = event;
        var ela = $(e.target);

        $('.selected', el).removeClass('selected');
        $('.many-dem-selected', el).removeClass('many-dem-selected');

        el.trigger('demand-editing-hide');

        stage2.trigger('close-stage-2', {resetform: true});
        
        $('.__selected', textDoc).removeClass('__selected');

        if(self.demandView)
            self.demandView.off();
    });

    if(editing)
    listDemand.on('demand-editing', function(event, d){
        var el = $(this);
        var d = d || {};

        stage1.removeClass('what-show-1').addClass('what-show-2');

    }).on('demand-editing-hide', function(){
        var el = $(this);
        var d = d || {};
        
        stage1.removeClass('what-show-1 what-show-2');

        textDoc.removeClass('edit-t-demand');
        
        fo.trigger('partial-reset');
    });

    if(editing)
    listDemand.on('demand-remove', function(event, d){
        var el = $(this);
        var d = d || {};
        var s = $('.selected', el);

        if(s.length < 1)
            return;

        var dataid = s.data('id-demand');
        var datapid = s.data('pid-demand') || [];

        var sendAjData = {
            nd: $('input[name="nd"]', fo).val(),
            id: $('input[name="id"]', fo).val(),
            id_demand: dataid
        };


        $.ajax({
             url: self.pluginKodObj.siteUrl +'doc/demand-remove',
             type: 'POST',
             data: sendAjData,
             dataType : 'json',
             error: self.ajaxError,
             complete: function(){
             },
             success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;

                listDemand.trigger('unSelectA');
                
                s.parent().remove();
                
                el.trigger('unpend-data-check', {arrPids: datapid});

                $('button[type="submit"]', submitClassifFo).prop('disabled', data.btnPaoDis);

                //$('.coco', stage1).text( data.demandsCounClassif );
             }
         });
    });

    if(editing)
    listDemand.on('unpend-data-check', function(event, d){
        var el = $(this);
        var data = d || {};
        var arrPids = data.arrPids;
        var a = $('a[data-pid-demand]', el);

        if(!arrPids)
            return;
        
        var suitable = [];

        a.each(function(){
            var sA = $(this);
            var arrPid = sA.data('pid-demand') || [];

            suitable = suitable.concat(arrPid);
        });


        var rmPid = arrPids.filter(function(itm, i) {

            return suitable.indexOf(itm) < 0;
        });

        self.unPendDataCheck({
            arrPids: rmPid
        });
    });


    var ajaxLoadClassif = null;
    
    listDemand.on('loadClassif', function(event, d){
        var obj = obj || {};
        var d = d || {};
        var sendAjData = d.sendAjData || {};

        if(ajaxLoadClassif != null)
             ajaxLoadClassif.abort();

        ajaxLoadClassif = $.ajax({
             url: self.pluginKodObj.siteUrl +'doc/get-demand-classif',
             type: 'POST',
             data: sendAjData,
             dataType : 'json',
             error: self.ajaxError,
             complete: function(){
             },
             success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;

                var guids = data.guids || [];

                guids.map(function(curVal){

                   if(!curVal)
                       return;

                   $('.vfm[value="'+ curVal +'"]', classifDemand).prop('checked', true);
                });

                $('.parent-blk-classificators', stage2).trigger('count-check-co-b');

                var inpDem = $('input[name="id_demand"]', classifDemand);
                    inpDem.val(sendAjData.id_demand);
                    inpDem.trigger('input');

                stage2.addClass('__visible fadeIn');
             }
         });

    });
    

    stage2.on('close-stage-2', function(e, d){
        var el = $(this);
        var d = d || {};

        allClassifBl.trigger('close-blk-classif');

        modalReadMade.trigger('close-ready-made');

        el.removeClass('__visible fadeIn');
        
        if(d.resetform)
            self.formReset({
                form: classifDemand
            });
    });

    if(editing)
    fo.on('add-text-part', function(e, data){
        var el = $(this);
        var d = d || {};
        //var pid = d.pid;
        //var text = d.text;

        var selPids = $('input[name="selectedpid"]', el);
        var valPids = selPids.val() || '';
        var arrPids = [];

        if(valPids && valPids !== '') {

            try {
                arrPids = JSON.parse(valPids);
            } catch (parserr) {}
        }


        if(arrPids.length < 1)
            return;

        var wheToInv = $('.text-parts', el);
            wheToInv.empty();


        for(var i = 0; i < arrPids.length; i++) {
            var p = arrPids[i];

            if(!p)
                continue;

            var s = $('.form-analysis-text-doc p[data-pid="'+ p +'"]');

            if(s.length < 1)
                continue;

            var textInfo = null;
            var isImg = $('img', s);
            var isTd = $(s).parent().is('td');

            if(isImg.length > 0 || isTd)
                textInfo = {};

            if(isImg.length > 0)
                textInfo.img = true;

            if(isTd)
                textInfo.td = true;

            var sText = $.trim( s.text() );
                sText = sText.replace(/\r|\n|/g, '').replace(/ {2,}/g, ' ');

            var inpHid = $('<input type="hidden" />');
                inpHid.prop('name', 'pidstext[]['+ i +'][pid]');
                inpHid.prop('value', p);

            wheToInv.append(inpHid);

            var inpHid = $('<input type="hidden" />');
                inpHid.prop('name', 'pidstext[]['+ i +'][text]');
                inpHid.prop('value', sText);

            wheToInv.append(inpHid);

            if(textInfo) {

                var inpHid = $('<input type="hidden" />');
                    inpHid.prop('name', 'pidstext[]['+ i +'][info]');
                    inpHid.prop('value', JSON.stringify(textInfo));

                wheToInv.append(inpHid);
            }
        }

    }).on('remove-text-part', function(e, data){
        var el = $(this);
        var wheToInv = $('.text-parts', el);

        wheToInv.empty();
    });

    if(editing)
    fo.submit(function(event){

        event.preventDefault ? event.preventDefault() : (event.returnValue = false);

        var jqForm = $(this);
        var submitBut = $('button[type="submit"]', jqForm);
            submitBut.prop('disabled', true);

        var attrAction = jqForm.attr('action');
        var selPids = $('input[name="selectedpid"]', jqForm);

        if(!selPids.val())
            return false;

        jqForm.trigger('add-text-part');

        var sendAjData = jqForm.serializeArray();

        jqForm.trigger('remove-text-part');

        if((!sendAjData) || (sendAjData.length < 1))
            return false;

        $.ajax({
            url: attrAction,
            type: 'POST',
            data: sendAjData,
            dataType : 'json',
            error: self.ajaxError,
            complete: function(){
            },
            success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;

                submitBut.prop('disabled', true);

                var cuitAd = $('p[data-pid].__selected', textDoc);
                    cuitAd.removeClass('__selected').addClass('is-checked');

                listDemand.trigger('demand-editing-hide');

                self.formReset({
                    form: jqForm
                });

                $('button[type="submit"]', submitClassifFo).prop('disabled', data.btnPaoDis);

                if(!data.html)
                    return;

                var jqHTML = $(data.html);
                    jqHTML.hide();

                if(data.replace) {

                    var findRepl = $('a[data-id-demand="'+ data.id_demand +'"]', listDemand);
                    var dte = findRepl.data('pid-demand') || [];

                    var repParr = findRepl.parent();

                    $(repParr).replaceWith(jqHTML);

                    jqHTML.fadeIn();

                    if(data.pids)
                        listDemand.trigger('unpend-data-check', {arrPids: dte});

                } else {

                    $('.trueis-1', listDemand).remove();

                    listDemand.prepend(jqHTML);

                    var liFirst = $('li:first', listDemand);
                        liFirst.fadeIn();

                }

                //if(data.counClassif)
                //    $('.coco', stage1).text( data.counClassif );
            }
        });
        
    });

    /* ------stage-2------ */
    
    self.parenTBlKClassificators({
        mB: stage2,
        editing: editing
    });


    if(editing)
    classifDemand.submit(function(event){

        event.preventDefault ? event.preventDefault() : (event.returnValue = false);

        var jqForm = $(this);
        var submitBut = $('button[type="submit"]', jqForm);
            submitBut.attr('disabled', true);

        var attrAction = jqForm.attr('action');
        
        jqForm.trigger('form-check', {startSubmit: true});
        
        var invalid = $('.__invalid', jqForm);

        if(invalid.length > 0) {
            
            // Временно. Только для средства отладки
            alert('No service attributes');

            submitBut.removeAttr('disabled');
            return false;
        }

        var sendAjData = jqForm.serializeArray();

        if((!sendAjData) || (sendAjData.length < 1))
            return false;

        if(self.AJAXProcess != null)
            self.AJAXProcess.abort();

        self.AJAXProcess = $.ajax({
            url: attrAction,
            type: 'POST',
            data: sendAjData,
            dataType : 'json',
            error: self.ajaxError,
            complete: function(){

                window.setTimeout(function(){

                    submitBut.removeAttr('disabled');
                }, 1000);
            },
            success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;

                var selDemand = $('a.selected', listDemand);
                    selDemand.toggleClass('there-are-classif', data.countDemandClassif > 0);

                //$('.coco', stage1).text( data.counClassif );
            }
        });
        
    });

    classifDemand.on('reset', function(){
        var el = $(this);
        
        $('.parent-blk-classificators', el).trigger('clear-co-b');
    });

    
    /* --------------- */


    modalReadMade.on('close-ready-made', function(){
        var el = $(this);

        el.removeClass('__visible');
        el.removeAttr('style');
    });

    // Возможно тирггер
    $('.close-elbl.st-predef', readyMade).click(function(){

        modalReadMade.trigger('close-ready-made');
    });    

    
    //  Показать пресеты
    if(editing)
    $('.select-pred', readyMade).click(function(){
        var el = $(this);
        var prSt = modalReadMade;
        var isExpa = readyMade.hasClass('__visible');

        prSt.toggleClass('__visible');

        if(!isExpa) {

            prSt.animate({opacity: 1});
        } else {

            prSt.removeAttr('style');
        }
    });
    
    if(editing)
    $('.save-pred-values', readyMade).click(function(){
        var el = $(this);

        var clone = $('.pieces-tmpl .template-strange-form').clone();
            clone.removeClass('template-strange-form');

        var workForm = $('form', clone);
            workForm.prop('name', 'ready-made-name-f');

        self.hotValidInput({
            form: workForm
        });

        var hasris1 = $('.rm-list .is-1', modalReadMade);

        var mkname = self.i18n('New Selection');
            mkname += hasris1.length < 1 ? '' : ' '+ (hasris1.length + 1);

        var newgnd = $('input[name="def-name"]', workForm);
            newgnd.prop('value', mkname);
                
        var newset = $('div[name="def-set"]', workForm);
            newset.prop('hidden', false);

        workForm.submit(function(event){

            event.preventDefault ? event.preventDefault() : (event.returnValue = false);

            var jqForm = $(this);
            var parentDialog = jqForm.data('parentDialog');

            var sendAjData = classifDemand.serializeArray();

            var nosave = true;

            sendAjData.map(function(i) {

               if(!i)
                   return;

               if(i.name.indexOf('guids[') > -1)
                   nosave = false;
            });

            if(nosave)
                return;

            sendAjData.unshift({name: 'name_made', value: newgnd.val()});
            
            var valset = $('input[name="set_made_ctx"]:visible');
            sendAjData.unshift({name: 'set_made_ctx', value: valset.prop('checked') ? 'on' : 'off'});

            $.ajax({
                url: 'ready-made',
                type: 'POST',
                data: sendAjData,
                dataType : 'json',
                error: self.ajaxError,
                complete: function(){

                    /*
                    window.setTimeout(function(){

                        el.removeClass('pro-saved');
                    }, 1000);
                    */
                },
                success: function(data, textStatus, jqXHR) {

                    var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                    if(!emptyReply)
                        return;

                    if(!data.html)
                        return;

                    var insertNode = $('.rm-list-ul', readyMade);

                    var jqHTML = $(data.html);

                    $('.trueis-1', insertNode).remove();


                    insertNode.prepend(jqHTML);

                    if(parentDialog)
                        parentDialog.dialog('close');
                }
            });

        });

        self.openjQueryDialog({
             title: self.i18n('Saving a set of values')
            ,htmlBody: clone
        });
    });

    if(editing)
    $('.rm-list-ul', readyMade).click(function(e){
        var el = $(this);
        var ela = $(e.target);
        
        if(!ela.is('a'))
            return;
        
        var isDisab = ela.hasClass('disab');
        
        if(isDisab)
            return;
        
        var cross = $('.close-elbl.st-predef', readyMade);
        
        ela.addClass('disab');
        
        var datapid = ela.data('made-id');
        
        if(!datapid)
            return;

        $.ajax({
            url: self.pluginKodObj.siteUrl +'doc/get-ready-made',
            type: 'POST',
            data: {id: datapid},
            dataType : 'json',
            error: self.ajaxError,
            complete: function(){

                window.setTimeout(function(){

                    ela.removeClass('disab');
                }, 1000);
            },
            success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;

                if(!data.guids)
                    return cross.click();

                var guids = data.guids || [];

                $('.vfm', classifDemand).prop('checked', false);

                guids.map(function(curVal){

                   if(!curVal)
                       return;

                   $('.vfm[value="'+ curVal +'"]', classifDemand).prop('checked', true);
                });

                var moreParr = $('.parent-blk-classificators', stage2);
                    moreParr.trigger('count-check-co-b');

                cross.click();
            }
        });
        
    });


    $('.disband-demand', stage1).click(function(){

        listDemand.trigger('demand-remove');
    });

    /* ---------------------- */

    /*
     * Форма отправки передачи классификации следующему эксперту
     */

    submitClassifFo.submit(function(event){

        event.preventDefault ? event.preventDefault() : (event.returnValue = false);

        var jqForm = $(this);
        var submitBut = $('button[type="submit"]', jqForm);
            submitBut.attr('disabled', true);

        var attrAction = jqForm.attr('action');

        var sendAjData = jqForm.serializeArray();

        if((!sendAjData) || (sendAjData.length < 1))
            return false;

        if(self.AJAXProcess != null)
            self.AJAXProcess.abort();

        self.AJAXProcess = $.ajax({
            url: attrAction,
            type: 'POST',
            data: sendAjData,
            dataType : 'json',
            error: self.ajaxError,
            complete: function(){

                window.setTimeout(function(){

                    $('input[name="back"]', jqForm).removeAttr('value');

                    submitBut.removeAttr('disabled');
                }, 1000);
            },
            success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;

                var url = location.pathname +''+ location.search;

                $(window).trigger('loadAjaxData', {href: url, replaceState: true});

/*

                $('input[name="typestep"]', jqForm).prop('value', data.currTypeStep);
                
                var btnSubmit = $('button[type="submit"]', jqForm);

                btnSubmit.removeAttr('data-s');
                btnSubmit.attr('data-s', data.currTypeStep);
                
                btnSubmit.toggleClass('__green_btn', data.greenBtn);
                
                <button type="button" class="btn return-to-classif">
*/

            }
        });

    });

    $('.return-to-classif', submitClassifFo).click(function(){

        $('input[name="back"]', submitClassifFo).val(1);

        submitClassifFo.submit();
    });

    // Вкладки
    // Скорее всего придётся переделывать
    $('.mode-tabs', mB).click(function(event, data){
        var el = $(this);
        var e = event;
        var ela = $(e.target);

        if(!ela.is('a'))
            return;
        
        var dataOpen = ela.data('open');
        
        if(!dataOpen)
            return;
        
        var findTab = $('[data-tab="'+ dataOpen +'"]');

        if(findTab.length < 1)
            return;

        $('.__active', el).removeClass('__active');
        
        ela.addClass('__active');

        mB.toggleClass('mode-is-broom', dataOpen === 'mode-broom');

        listDemand.trigger('unSelectA');
        listBroom.trigger('unSelectA');

        $('.view-mode__tooltip').hide();
    });
    
    var firstClickT = $('.mode-tabs .first-click', mB);
        firstClickT.click();


    self.demandView = new DemandView(self); // Иницилизируем модуль просмотра требований/группировки текста требования
};

Classification_Doc_Collections.prototype.parenTBlKClassificators = function(obj) {
    var self = this;
    var obj = obj || {};
    var mB = $(obj.mB);
    var editing = (obj['editing'] == 'true' || obj['editing'] === true) || false;
    var noScrollTo = obj.noScrollTo;
    
    $('.parent-blk-classificators', mB).on('close-blk-classif', function(){
        var el = $(this);

        el.removeClass('__visible fadeIn');
    });

    $('.parent-blk-classificators', mB).on('clear-co-b', function(){
        var el = $(this);

        $('.selected-counter', el).remove();
    });

    $('.parent-blk-classificators', mB).on('count-check-co-b', function(){
        var el = $(this),
            allCheck = $('input.vfm:checked', el),
            cloneUl = $('.in-rank-0', el).clone(),
            input = $('input.vfm', cloneUl),
            notCheck = input.filter(':not(:checked)'),
            selectedCounter = allCheck.length ? allCheck.length : 0;

            cloneUl.removeAttr('class');

            $('.exp-all-bran', cloneUl).remove();

            notCheck.parent().remove();

            input.remove();

        $('.selected-counter', el).remove();

        switch (selectedCounter) { // количество выбранных классификаторов
            case 1:
                var templateOne =   '<span class="selected-counter without-classif">' +
                                        '<span class="co-b">' + self.i18n('Selected') + ': ' + '</span>' +
                                        '<span class="one-classif">'+ allCheck.siblings().html() + '</span>' +
                                    '</span>';

                $('.exp-all-bran', el).append(templateOne);
                break;
            case 0:
                $('.selected-counter', el).remove();
                break;
            default:
                var templateTwo =   '<span class="selected-counter">' +
                                        '<span class="co-b">' + self.i18n('Selected') + ': </span>' +
                                        '<a href="javascript:;" class="tooltip-link">' + selectedCounter + '</a>' +
                                    '</span>';

                $('.exp-all-bran', el).append($(templateTwo));

                cloneUl.find('li').each(function() { if($(this).text() === '') $(this).css('margin', '0px')});

                $('.selected-counter', el).webuiPopover({
                    content: cloneUl,
                    placement: 'bottom-left',
                    width: '310px',
                    style: 'tooltip'
                });
        }
    });


    $('.parent-blk-classificators .close-elbl.st-11-cl', mB).click(function(){
        var el = $(this);
        var parr = $(el).parents('.parent-blk-classificators');

        parr.trigger('count-check-co-b');
        
        //parr.trigger('only-choose-classif');
        
        parr.trigger('close-blk-classif');
        parr.trigger('only-choose-classif-clear');
    });
    

    $('.parent-blk-classificators a.exp-all-evt', mB).click(function(){
        var el = $(this);
        var parr = el.parents('.parent-blk-classificators');

        parr.trigger('only-choose-classif');
        parr.addClass('__visible fadeIn');
    });

    $('.parent-blk-classificators', mB).click(function(e){
        var el = $(this);
        var ela = $(e.target);

        if(!ela.is('input'))
            return;

        var chec = ela.prop('checked');

        var parLi = ela.parent();
        var neUl = parLi.next('ul');

        if(neUl.length < 1)
            return;

        $('input[type="checkbox"]', neUl).prop('checked', chec);
    });

    if(editing)
    $('.parent-blk-classificators .exp-all-bran .remove-all', mB).click(function(){
        var el = $(this);
        var parr = el.parents('.parent-blk-classificators');

        parr.trigger('clear-co-b');
        parr.trigger('only-choose-classif-clear');

        parr.trigger('close-blk-classif');

        var ivgm = $('input.vfm', parr);
            ivgm.prop('checked', false);
            ivgm.removeClass('__invalid');
            
        var attrForm = $(ivgm.prop('form'));

        if(attrForm.length > 0)
            attrForm.trigger('form-check');
    });
    
    if(editing)
    $('.parent-blk-classificators .exp-all-bran .choose-all', mB).click(function(){
        var el = $(this);
        var parr = el.parents('.parent-blk-classificators');

        var ivgm = $('input.vfm', parr);
            ivgm.prop('checked', true);
        
        var attrForm = $(ivgm.prop('form'));

        if(attrForm.length > 0)
            attrForm.trigger('form-check');
        
        parr.trigger('only-choose-classif-clear');
    });


    $('.parent-blk-classificators', mB).on('only-choose-classif', function(){
        var el = $(this);
        var atLeatsOne = $('input.vfm:checked', el);
        var ul = $('.in-rank-0', el);
        var inClone = $('.only-choose-classif', el);
        
        inClone.empty();

        if(atLeatsOne.length < 1) {

            if(editing) {

                ul.removeClass('checked-only');
                
                return;
            }

            var divEmpt =
                '<div class="empty-choose-classif">'+
                self.i18n('There are no selected classifier items')+
                '</div>';

            inClone.html(divEmpt);
            
            ul.addClass('checked-only');

            return;
        }

        var cloneUl = ul.clone();
            cloneUl.removeAttr('class');

        $('.exp-all-bran', cloneUl).remove();

        var input = $('input.vfm', cloneUl);

        var notCheck = input.filter(':not(:checked)');
            notCheck.parent().remove();
        
        if(editing) {
            var check = input.filter(':checked');

            check.each(function(){
                var c = $(this);
                var p = c.parent('label');

                if(p.length < 1)
                    return;

                p.data('value', c.val());
            });

            $('label', cloneUl).click(function(){
                var l = $(this);
                var datVal = l.data('value');

                if(!datVal)
                    return;

                var toScro = $('input[value="'+ datVal +'"]', ul).parent();

                if(toScro.length < 1)
                    return;

                ul.removeClass('checked-only');
                ul.scrollTo(toScro, {duration: 480, axis: 'y'});
            });
        }

        input.remove();

        for(var i = 0; i < 3; i++) {

            $('li:empty', cloneUl).remove();
            $('ul:empty', cloneUl).remove();
        }


        inClone.html(cloneUl);

        ul.addClass('checked-only');
    });

    $('.parent-blk-classificators', mB).on('only-choose-classif-clear', function(){
        var el = $(this);
        var ul = $('.in-rank-0', el);
        var inClone = $('.only-choose-classif', el);

        ul.removeClass('checked-only');

        inClone.empty();
    });

    
    var intervalNextMatch = null;

    if(editing)
    $('.parent-blk-classificators input.star-sear-class', mB).on('keypress keyup', function(e){
        var keyCode = e.keyCode || e.which;

        return keyCode !== 13;
    }).focus(function(){
        var el = $(this);
        var parr = el.parents('.parent-blk-classificators');
        var ul = $('.in-rank-0', parr);
        //var inClone = $('.only-choose-classif', parr);

        ul.removeClass('checked-only');
        
    }).blur(function(){
        //var el = $(this);
        //var parr = el.parents('.parent-blk-classificators');
        //var ul = $('.in-rank-0', parr);

        //console.log('blur');
    }).on('input', function(){
        var el = $(this);
        var parr = el.parents('.parent-blk-classificators');
        var ul = $('.in-rank-0', parr);

        var val = el.val() || '';

        if(val.length < 2) {
            
            parr.trigger('end-search-mode');
            return;
        }

        ul.addClass('search-mode');

        if(intervalNextMatch)
            window.clearTimeout(intervalNextMatch);


        intervalNextMatch = window.setTimeout(function(){
            
            intervalNextMatch = null;
            
            $('.search-results', ul).removeClass('search-results');
            
            var searEl = $("span:Contains('"+ val +"')", ul);
            
            if(searEl.length < 1)
                return;
            
            var lb = searEl.parents('label');

            lb.addClass('search-results');

        }, 280);
    });
    
    if(editing)
    $('.parent-blk-classificators', mB).on('end-search-mode', function(){
        var el = $(this);
        var ul = $('.in-rank-0', el);

        ul.removeClass('search-mode');
        
        $('.search-results', ul).removeClass('search-results');
    });

    if(editing)
    $('.parent-blk-classificators .icon-cross', mB).click(function(e){
        var el = $(this);
        var parr = el.parents('.parent-blk-classificators');

        $('input.star-sear-class', parr).prop('value', null);

        parr.trigger('end-search-mode');
    });


    // Переписать !!!
    var preloadGuids = $('.preload-guids', mB);

    if(preloadGuids.length > 0) {

        var guids = [];
        
        try {

            guids = JSON.parse(preloadGuids.text());
        } catch(err){}

        guids.map(function(curVal){

           if(!curVal)
               return;

           $('.vfm[value="'+ curVal +'"]', mB).prop('checked', true);
        });


        $('.parent-blk-classificators', mB).trigger('count-check-co-b');
    }
    // END Переписать !!!
};

Classification_Doc_Collections.prototype.broomMode = function(obj) {
    var self = this;
    var obj = obj || {};
    var mB = $(obj.mB);
    var editing = obj['editing'] == 'true' || false;

    var listBroom = $('.mode-o-broom .rm-list-ul', mB);
    var broomValues = $('.mode-o-broom .broom-values', mB);

    var fo = $(document.forms['demand-into-parts']);
    var insertNode = $('input[name="selectedpid"]', fo);
    var foSubmit = $('button[type="submit"]', fo);
    
    var textDoc = $('.form-analysis-text-doc', mB);
    
    //var stage1 = $('.doc-analysis-stage-1', mB);
    //var listDemand = $('.in-l-demand .list-demand', stage1);
    
    //var stage2 = $('.doc-analysis-stage-2', mB);
    //var allClassifBl = $('.parent-blk-classificators', stage2);
    
    //var readyMade = $('.ready-bt-made', mB);
    //var modalReadMade = $('.pr-st', readyMade);

    //var classifDemand = $(document.forms['save-current-classif']);
    
    //var submitClassifFo = $(document.forms['submit-classification']);
    
    fo.on('partial-reset-brooms', function(){
        var el = $(this);

        $('input[name="id_demand"]', el).prop('value', null);
        $('input[name="selectedpid"]', el).prop('value', null);
        
        $('.__selected', textDoc).removeClass('__selected');

        foSubmit.prop('disabled', true);
    });

    var ajSaveMade = function(data, textStatus, jqXHR) {

        if(!data.html)
            return;

        var jqHTML = $(data.html);

        $('.trueis-1', listBroom).remove();

        listBroom.prepend(jqHTML);
    };

    $('.brooms-blk .add-made', mB).click(function(){

        self.openLoadMade({ajaxSuccessSave: ajSaveMade});
    });

    listBroom.on('click.selectA', function(event, data){
        var el = $(this);
        var e = event;
        var ela = $(e.target);
        //var datapid = ela.data('pid-demand');
        var dataid = ela.data('made-id');

        if(!ela.is('a'))
            return;

        var isSel = ela.hasClass('selected');

        el.trigger('unSelectA');

         if((isSel) || (!dataid))
             return;

        //el.trigger('demand-editing');
        //fo.trigger('partial-reset');

        ela.addClass('selected');

        el.trigger('loadReadyMade', {
            sendAjData: {
                id: dataid,
                broom: 1,
                id_doc: $('input[name="id"]', fo).val()
            }
        });

    });

    listBroom.on('unSelectA', function(event, d){
        var el = $(this);
        var d = d || {};
        var e = event;
        var ela = $(e.target);

        $('.selected', el).removeClass('selected');
        $('.many-dem-selected', el).removeClass('many-dem-selected');
        
        broomValues.trigger('_reset');

        fo.trigger('partial-reset');

        //el.trigger('demand-editing-hide');

        //stage2.trigger('close-stage-2', {resetform: true});
        
        $('.__selected', textDoc).removeClass('__selected');

        self.demandView.off();
    });

    var ajaxLoadPidToBroom = null;

    listBroom.on('selectDemandToPid', function(e, data){
        var el = $(this);
        //var a = $('a[data-made-id]', el);
        var datP = data.pid;

        var sendAjData = {
            pid: datP,
            id_doc: $('input[name="id"]', fo).val()
        };

        if(ajaxLoadPidToBroom != null)
            ajaxLoadPidToBroom.abort();

        ajaxLoadPidToBroom = $.ajax({
            url: self.pluginKodObj.siteUrl +'doc/get-from-brooms',
            type: 'POST',
            data: sendAjData,
            dataType : 'json',
            //error: self.ajaxError,
            complete: function(){
            },
            success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;
                
                var madesid = data.mades;

                if(!madesid)
                    return;
                
                madesid.forEach(function(ma){

                    var nj = $('a[data-made-id="'+ ma +'"]', el);
                        nj.addClass('many-dem-selected');
                });

                var fif = $('a.many-dem-selected', el).first();

                el.scrollTo(fif, {duration: 480, axis: 'y'});
            }
        });

    });

/*
    if(editing)
    listDemand.on('demand-editing', function(event, d){
        var el = $(this);
        var d = d || {};

        stage1.removeClass('what-show-1').addClass('what-show-2');

    }).on('demand-editing-hide', function(){
        var el = $(this);
        var d = d || {};
        
        stage1.removeClass('what-show-1 what-show-2');

        textDoc.removeClass('edit-t-demand');
        
        fo.trigger('partial-reset');
    });

    if(editing)
    listDemand.on('demand-remove', function(event, d){
        var el = $(this);
        var d = d || {};
        var s = $('.selected', el);

        if(s.length < 1)
            return;

        var dataid = s.data('id-demand');
        var datapid = s.data('pid-demand') || [];

        var sendAjData = {
            nd: $('input[name="nd"]', fo).val(),
            id: $('input[name="id"]', fo).val(),
            id_demand: dataid
        };


        $.ajax({
             url: self.pluginKodObj.siteUrl +'doc/demand-remove',
             type: 'POST',
             data: sendAjData,
             dataType : 'json',
             error: self.ajaxError,
             complete: function(){
             },
             success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;

                listDemand.trigger('unSelectA');
                
                s.parent().remove();
                
                el.trigger('unpend-data-check', {arrPids: datapid});


                $('button[type="submit"]', submitClassifFo).prop('disabled', data.btnPaoDis);

                $('.coco', stage1).text( data.demandsCounClassif );
             }
         });
    });

    if(editing)
    listDemand.on('unpend-data-check', function(event, d){
        var el = $(this);
        var data = d || {};
        var arrPids = data.arrPids;
        var a = $('a[data-pid-demand]', el);

        if(!arrPids)
            return;
        
        var suitable = [];

        a.each(function(){
            var sA = $(this);
            var arrPid = sA.data('pid-demand') || [];

            suitable = suitable.concat(arrPid);
        });


        var rmPid = arrPids.filter(function(itm, i) {

            return suitable.indexOf(itm) < 0;
        });

        self.unPendDataCheck({
            arrPids: rmPid
        });
    });
*/

    var ajaxLoadMade = null;
    
    listBroom.on('loadReadyMade', function(event, d){
        var obj = obj || {};
        var d = d || {};
        var sendAjData = d.sendAjData || {};

        if(ajaxLoadMade != null)
            ajaxLoadMade.abort();

        ajaxLoadMade = $.ajax({
            url: self.pluginKodObj.siteUrl +'doc/get-ready-made',
            type: 'POST',
            data: sendAjData,
            dataType : 'json',
            //error: self.ajaxError,
            complete: function(){
            },
            success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;
                
                var datapid = data.pids;

                if(data.pids) {

                    self.demandView.on();

                    self.prePendDataCheck({
                        arrPids: datapid,
                        classes: '__selected'
                    });

                    var fiPid = datapid.sort().slice(0, 1);
                    var toscr = $('p[data-pid="'+ fiPid +'"]');

                    var searchScroll = $('kdoc', textDoc).scrollParent();

                    if(toscr.length > 0)
                        searchScroll.scrollTo(toscr, {duration: 480, axis: 'y'});
                }


                if(!data.toul)
                    return;
                
                var jqHTML = $(data.toul);

                $('.bro-values', broomValues).html(jqHTML);
                
                broomValues.addClass('__visible fadeIn');
            }
        });

    });
    
    broomValues.on('_reset', function(event, d){
        var el = $(this);
        var data = d || {};

        el.removeClass('__visible fadeIn');

        $('.bro-values', el).empty();
    });
    
    /*
     * Переделать на trigger
     * Создание требования из под "веников"
     */

    if(editing)
    textDoc.click(function(e){
        var el = $(this);
        var shiftKey = e.shiftKey;
        var ctrlKey = e.ctrlKey;
        //var editDemand = el.hasClass('edit-t-demand');
        var isBroom = mB.hasClass('mode-is-broom');
        var selBroom = $('.selected', listBroom);

        if(!isBroom)
            return;

        var ela = $(e.target);
        var elp = ela.is('p') ? ela : ela.parents('p');

        var dataPid = elp.data('pid');

        if(!dataPid)
            return;

        dataPid = parseInt(dataPid, 10);

        var isSelected = elp.hasClass('__selected');
        var isChecked = elp.hasClass('is-checked');

        var addPid = isSelected ? false : true;

        if(
            isChecked
            && selBroom.length < 1
            //&& !isSelected 
            //&& !shiftKey 
            //&& !ctrlKey
        )
            listBroom.trigger('selectDemandToPid', {pid: dataPid});


        // Кусок параши
        if(selBroom.length < 1) {
            
            listBroom.trigger('unSelectA');
            elp.toggleClass('__selected', addPid);
        }


        if(selBroom.length < 1)
            return;
        
        var idBroom = selBroom.data('made-id');

        if(!idBroom)
            return;
        

        if(shiftKey) {

            el.trigger('select-shift', {elp: elp});

        } else {

            if(!ctrlKey)
                fo.trigger('partial-reset-brooms');

            insertNode.trigger('addRemovePids' , {pid: dataPid, add: addPid});

            if(!ctrlKey && addPid) {

                $('input[name="from_broom"]', fo).prop('value', idBroom);
                
                fo.submit();
            }
            
            elp.toggleClass('__selected', addPid);
        }


        var kupAdd = 'keyup.add-demand';

        if(shiftKey || ctrlKey)
            $(document).off(kupAdd).on(kupAdd, function(e){
                var keyCode = e.keyCode || e.which;
                var okCode = keyCode === 16 || keyCode === 17;

                $(this).off(kupAdd);
                
                if(!okCode)
                    return;
                
                $('input[name="from_broom"]', fo).prop('value', idBroom);
                
                fo.submit();
            });
    });
};//
//

Classification_Subsystem_History.prototype.state = null;
Classification_Subsystem_History.prototype.arrState = [];

Classification_Subsystem_History.prototype.isHistory = function(){
    
    return !('pushState' in history);
};

Classification_Subsystem_History.prototype.historyInit = function() {
    var self = this;
    
    if(self.isHistory())
        return;

    $(window).on('popstate', function(event){
        var orgEv = event.originalEvent;

        if(!orgEv)
            return;
        
        var staObj = orgEv.state;

        if(!staObj)
            return;

        $.extend(staObj, {'popstate': true});

        $(window).trigger('loadAjaxData', staObj);
    });


    self.replaceState({
            'href': location.href
        },
        null,
        location.href
    );
};

Classification_Subsystem_History.prototype.pushState = function(state, title, url) {
    var self = this;
    
    if(self.isHistory())
        return;

    history.pushState(state, title, url);
};

Classification_Subsystem_History.prototype.replaceState = function(state, title, url) {
    var self = this;
    
    if(self.isHistory())
        return;

    history.replaceState(state, title, url);
};

Classification_Subsystem_History.prototype.scrollToHistory = function(obj) {
    var self = this;
    var obj = obj || {};
    
    if(self.isHistory())
        return;

    var state = history.state || {};

    if(!state.href || !obj.restScroll)
        return;

    state.scroll = state.scroll || {};

    state.scroll[obj.restScroll] = obj;

    self.replaceState(state, null, state.href);
};

Classification_Subsystem_History.prototype.restoreScroll = function(obj) {
    var self = this;
    //var obj = obj || {};
    //callback

    if(self.isHistory())
        return;

    var state = history.state || {};

    if(!state.scroll)
        return;

    for(var i in state.scroll) {
        var itm = state.scroll[i];

        var scrEl = $('[data-rest-scroll="'+ itm.restScroll +'"]');

        if(scrEl.length < 1)
            continue;

        scrEl.scrollTo({left: itm.x, top: itm.y});
    }
};

Classification_Subsystem_History.prototype.emulationHistoryButtons = function(obj) {
    var self = this;
    var obj = obj || {};
    var context = $(obj['context']);
    var dialogs = $('.wrapper #dialogs');

    var destroyF = function(){

        var di = $('.ui-dialog-content', dialogs);

        try {
            
            di.dialog('destroy');
        } catch(err){}
    };
    
    if(context.length < 1)
        return;
    
    $('.history-back', context).click(function(){
        var cu = $(this);
        
        if(cu.hasClass('unactive'))
            return;
        
        destroyF();

        window.history.back();
    });

    $('.history-forward', context).click(function(){
        var cu = $(this);
        
        if(cu.hasClass('unactive'))
            return;
        
        //destroyF();
        
        window.history.forward();
    });

    $(window).on('loadAjaxData', function(){

        $('.unactive', context).removeClass('unactive');
    });
};//
//

/*
Classification_Pan_Main.prototype.ok1 = null;
Classification_Pan_Main.prototype.arrOk = [];
*/

Classification_Pan_Main.prototype.nigger = function(options){
    /*console.log(options.reports);
    options.reports = JSON.toString(options.reports);
    console.log(options.reports);
    JSON.stringify(options.reports);*/
    var ndList = options.nd.split(",");
    var nd = ndList[0];
    if(('' + options.reports).indexOf('disablednd') >= 0)
        $.ajax({
            url: self.pluginKodObj.siteUrl + 'pan/reports?reports=disablednd&nd=' + nd, //http://127.0.0.1:88/docs/text_field/links?nd=557592001', //self.pluginKodObj.siteUrl +'doc/demand-remove',
            type: 'GET',
            //data: sendAjData,
            dataType : 'json',
            error: self.ajaxError,
            complete: function(){
            },
            success: function(data, textStatus, jqXHR) {
                $('#disablednd_dislinks').html(data.disLinks);
                $('#disablednd_actlinks').html(data.actLinks);
                //{{#if actLinks}}Требует актуализации{{/if}}
                if(data.disLinks > 0) $('#disablednd_actual').html('Требует актуализации');
                //$('#disablednd_href').prop('disabled', true);
                //alert(data);
            }
        });
    if(('' + options.reports).indexOf('normative') >= 0)
        $.ajax({
            url: self.pluginKodObj.siteUrl + 'pan/reports?reports=normative&nd=' + nd,
            type: 'GET',
            dataType : 'json',
            error: self.ajaxError,
            complete: function(){
            },
            success: function(data, textStatus, jqXHR) {
                $('#normative_alllinks').html(data.allLinks);
                $('#normative_incllinks').html(data.inclLinks);
                //$('#normative_alllinks').html(1);
                //$('#normative_incllinks').html(2);

                //{{#if actLinks}}Требует актуализации{{/if}}
                //if(data.disLinks > 0) $('#disablednd_actual').html('Требует актуализации');
                //$('#disablednd_href').prop('disabled', true);
                //alert(data);
            }
        });
    if(('' + options.reports).indexOf('abbr') >= 0)
        $.ajax({
            url: self.pluginKodObj.siteUrl + 'pan/reports?reports=abbr&nd=' + nd, //http://127.0.0.1:88/docs/text_field/links?nd=557592001', //self.pluginKodObj.siteUrl +'doc/demand-remove',
            type: 'GET',
            //data: sendAjData,
            dataType : 'json',
            error: self.ajaxError,
            complete: function(){
            },
            success: function(data, textStatus, jqXHR) {
                $('#abbr_abbr').html(data.countAcronyms);
                /*$('#disablednd_actlinks').html(data.actLinks);*/
                //alert(data);
            }
        });
    if(('' + options.reports).indexOf('terms') >= 0)
        $.ajax({
            url: self.pluginKodObj.siteUrl + 'pan/reports?reports=terms&nd=' + nd, //http://127.0.0.1:88/docs/text_field/links?nd=557592001', //self.pluginKodObj.siteUrl +'doc/demand-remove',
            type: 'GET',
            //data: sendAjData,
            dataType : 'json',
            error: self.ajaxError,
            complete: function(){
            },
            success: function(data, textStatus, jqXHR) {
                $('#terms_terms').html(data.countTerms);
                $('#terms_termsnd').html(data.countTermsDiffDict);
                $('#terms_termsn').html(data.countTermsNotInDict);
            }
        });
    if(('' + options.reports).indexOf('abbr-comp') >= 0)
        $.ajax({
            url: self.pluginKodObj.siteUrl + 'pan/reports?reports=abbr-comp&nd=' + nd, //http://127.0.0.1:88/docs/text_field/links?nd=557592001', //self.pluginKodObj.siteUrl +'doc/demand-remove',
            type: 'GET',
            //data: sendAjData,
            dataType : 'json',
            error: self.ajaxError,
            complete: function(){
            },
            success: function(data, textStatus, jqXHR) {
                $('#abbr-comp_abbr').html(data.countAbbrs);
                $('#abbr-comp_termsnd').html(data.countTermsDiffDict);
                $('#abbr-comp_termsn').html(data.countTermsNotInDict);
            }
        });
    if(('' + options.reports).indexOf('type-1') >= 0) {
        $.ajax({
            url: self.pluginKodObj.siteUrl + 'pan/reports?reports=type-1&nd=' + ndList.join('&nd='), //http://127.0.0.1:88/docs/text_field/links?nd=557592001', //self.pluginKodObj.siteUrl +'doc/demand-remove',
            type: 'GET',
            //data: sendAjData,
            dataType: 'json',
            error: self.ajaxError,
            complete: function () {
            },
            success: function (data, textStatus, jqXHR) {
                $('#type-1_completed').html(data.completed);
                $('#type-1_not-started').html(data.not_started);
                $('#type-1_during').html(data.during);
                $('#type-1_agreement').html(data.agreement);
                if (data.na) {
                    $('#type-1_link').closest('.info-block').find('div:not(.info-title)').addClass('__hidden');
                    $('#type-1_link').closest('.info-block').append("<div class='__margin-top_l'>Отчет недоступен</div>");
                }
            }
        });

    }
    if(('' + options.reports).indexOf('type-2') >= 0) {
        $.ajax({
            url: self.pluginKodObj.siteUrl + 'pan/reports?reports=type-2&nd=' + ndList.join('&nd='), //http://127.0.0.1:88/docs/text_field/links?nd=557592001', //self.pluginKodObj.siteUrl +'doc/demand-remove',
            type: 'GET',
            //data: sendAjData,
            dataType: 'json',
            error: self.ajaxError,
            complete: function () {
            },
            success: function (data, textStatus, jqXHR) {
                $('#type-2_cnt').html(data.cnt);
                if (data.na) {
                    $('#type-2_link').closest('.info-block').find('div:not(.info-title)').addClass('__hidden');
                    $('#type-2_link').closest('.info-block').append("<div class='__margin-top_l'>Отчет недоступен</div>");
                }
            }
        });

    }
    if(('' + options.reports).indexOf('type-3') >= 0) {
        $.ajax({
            url: self.pluginKodObj.siteUrl + 'pan/reports?reports=type-3&nd=' + ndList.join('&nd='), //http://127.0.0.1:88/docs/text_field/links?nd=557592001', //self.pluginKodObj.siteUrl +'doc/demand-remove',
            type: 'GET',
            //data: sendAjData,
            dataType: 'json',
            error: self.ajaxError,
            complete: function () {
            },
            success: function (data, textStatus, jqXHR) {
                $('#type-3_all').html(data.cntAll);
                $('#type-3_classified').html(data.cntClassified);
                $('#type-3_unclassified').html(data.cntNotClassified);
                console.log(data);
                if (data.na) {
                    $('#type-3_link').closest('.info-block').find('div:not(.info-title)').addClass('__hidden');
                    $('#type-3_link').closest('.info-block').append("<div class='__margin-top_l'>Отчет недоступен</div>");
                }
            }
        });

    }
    return;
    $.ajax({
        url: self.pluginKodObj.siteUrl +'doc/demand-remove',
        type: 'POST',
        data: sendAjData,
        dataType : 'json',
        error: self.ajaxError,
        complete: function(){
        },
        success: function(data, textStatus, jqXHR) {

            var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

            if(!emptyReply)
                return;


        }
    });


};



Classification_Pan_Main.prototype.attrSearch = function(obj) {
    var self = this;
    var obj = obj || {};
    var obj = obj || {};
    var title = obj.title;
    var htmlBody = obj.htmlBody;

    //var clone = htmlBody.clone();

    //var workForm = $('form.attribute-search', clone);
    console.log(htmlBody);
    var workForm = $('form.attribute-search', htmlBody);
    console.log(workForm);
    workForm.prop('name', 'attribute-search');


    self.submitAttrSearch({
        form: workForm
    });
/*

    var closeCallBack = function() {
        var t = $(this);
        var nohis = t.data('nohistory');

        if(nohis)
            return;

        if(history.length > 2)
            return history.back();

        var url = self.pluginKodObj['siteUrl'];

        $(window).trigger('loadAjaxData', {'href': url});
    };*/
/*
    self.openjQueryDialog({
        title: title,
        dialogClass: 'attribute-search-dialog',
        htmlBody: clone,

        closeCallBack: closeCallBack
    });*/

    $.datepicker.setDefaults( $.datepicker.regional[ "ru" ] );
    $( ".dtp" ).datepicker();

    jQuery( '.classif-list' ).click( function() {
        return false;
    });
    jQuery( '.classif-it' ).click( function( e ) {
        var next = jQuery( this ).next();
        next.slideDown( 400, 'swing', function() { next.addClass( 'opened' ); } );
    });
    jQuery( '.part-attr-search' ).click( function() {
        jQuery( '.classif-list.opened' ).slideUp();
        jQuery( '.opened' ).removeClass( 'opened' );
    });
    jQuery( '.cllogic' ).change( function() {
        var parent = $( this ).parent();
        var txts = [];
        var ids = [];
        var separ = $( this ).find( 'option:selected' ).text();
        parent.find( '.classif-list' ).find( 'li' ).each( function() {
            if ( jQuery( this ).hasClass( 'active-c' ) ) {
                txts.push( jQuery( this ).text() );
                ids.push( jQuery( this ).attr( 'cid' ) );
            }
        });
        parent.find( 'input.it:first' ).val( txts.join( ' ' + separ + ' ' ) );
        parent.find( 'input[type="hidden"]' ).val( ids.join( ',' ) );
    });
    jQuery( '.datemode' ).change( function() {
        var parent = $( this ).parent();
        var pref = parent.find( '.date-pref' );
        var start = parent.find( '.start-date' );
        var end = parent.find( '.end-date' );
        pref.hide();
        start.show();
        end.show();
        switch( $( this ).val() ) {
            case '0':
            case '2':
                end.hide();
                break;
            case '1':
                start.hide();
                break;
            case '3':
            case '4':
                pref.show();
        }
    });
    jQuery( '.classif-list li' ).click( function() {
        if ( $( this ).hasClass( 'active-c' ) )
            $( this ).removeClass( 'active-c' );
        else
            $( this ).addClass( 'active-c' );
        var ul = $( this ).closest( 'ul' );
        var parent = ul.parent();
        var txts = [];
        var ids = [];
        var separ = parent.find( 'select:first option:selected' ).text();
        ul.find( 'li' ).each( function() {
            if ( jQuery( this ).hasClass( 'active-c' ) ) {
                txts.push( jQuery( this ).text() );
                ids.push( jQuery( this ).attr( 'cid' ) );
            }
        });
        parent.find( 'input.it:first' ).val( txts.join( ' ' + separ + ' ' ) );
        parent.find( 'input[type="hidden"]' ).val( ids.join( ',' ) );
    });
    jQuery( '.dtp' ).change( function() {
        var datas = [];
        $( this ).parent().parent().find( '.dtp' ).each( function() {
            datas.push( $( this ).val() );
        });
        $( this ).parent().parent().find( 'input:last' ).val( datas.join( ',' ) );
    });
};

Classification_Pan_Main.prototype.submitAttrSearch = function(obj) {
    var self = this;
    var obj = obj || {};
    var form = obj['form'];
    var insertNode = obj['insertNode'];

    $(form).submit(function(event){
        event.preventDefault ? event.preventDefault() : (event.returnValue = false);

        var jqForm = $(this);
        var submitBut = $('button[type="submit"]', jqForm);
        submitBut.prop('disabled', true);

        var attrAction = jqForm.attr('action');
        var parentDialog = jqForm.data('parentDialog');

        /*      Не удалять, нужно
                jqForm.trigger('form-check', {startSubmit: true});

                var invalid = $('.__invalid', jqForm);

                if(invalid.length) {

                    submitBut.removeAttr('disabled');
                    return false;
                }
        */

        var sendAjData = jqForm.serializeArray();

        if((!sendAjData) || (sendAjData.length < 1))
            return false;

        if(self.AJAXProcess != null)
            self.AJAXProcess.abort();

        self.AJAXProcess = $.ajax({
            url: attrAction,
            type: 'GET',
            data: sendAjData,
            dataType : 'json',
            timeout: 240000,
            error: self.ajaxError,
            complete: function(){

                window.setTimeout(function(){

                    submitBut.prop('disabled', false);
                }, 1000);
            },
            success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;

                if(data.error) { //Временно

                    alert(data.error);
                    return;
                }

                if(!data.listid)
                    return;
/*
                if(parentDialog) {

                    parentDialog.data('nohistory', true);
                    parentDialog.dialog('close');
                }*/


                //var url = self.pluginKodObj['siteUrl'] +'attribute-search?listid='+ data.listid;
                var url = self.pluginKodObj['siteUrl'] +'pan/attribute-search?listid='+ data.listid;
                console.log(data);
                if(data.docsCount == 0) {
                    // модальное окно
                    self.openjQueryDialog({
                        title:  $(".__search-results-empty").attr('data-title'),
                        htmlBody: $(".__search-results-empty").removeClass('__hidden'),
                    });
                }
                else $(window).trigger('loadAjaxData', {'href': url});
            }
        });


    });

};

Classification_Pan_Main.prototype.getReports = function(obj) {
    var self = this;
    var obj = obj || {};
    var title = obj.title;
    var htmlBody = obj.htmlBody;

    var workForm = $('form.analytic-reports', htmlBody);
    console.log(workForm);
    workForm.prop('name', 'analytic-reports');
    $('input[name="nd"]', workForm).on('change', function () {
       var selectedDocuments =  $('[name="nd"]:checked', workForm);
       if (!selectedDocuments.length) {
           $('.__analytic-available-reports', workForm).addClass('__hidden');
           $('.__analytic-select-doc', workForm).removeClass('__hidden');
       } else {
           $('.__analytic-available-reports', workForm).removeClass('__hidden');
           $('.__analytic-select-doc', workForm).addClass('__hidden');
           if (selectedDocuments.length == 1) {
               $('.__analytic-report-for-many', workForm).addClass('__hidden');
               $('.__analytic-report-for-single', workForm).removeClass('__hidden');
           } else {
               $('.__analytic-report-for-single', workForm).addClass('__hidden');
               $('.__analytic-report-for-many', workForm).removeClass('__hidden');
           }
       }
        $('.__analytic-selected-docs-cnt', workForm).html(selectedDocuments.length);
    });
};//
//

Classification_Subsystem_ReadyMade.prototype.addMade = function(obj) {
    var self = this;
    var obj = obj || {};
    var mB = $(obj.mB);
    
    if(mB.length < 1)
        return;
    
    var ajaxSuccessSave = function(data) {

        if(!data.html)
            return;

        var url = location.pathname +''+ location.search;

        $(window).trigger('loadAjaxData', {href: url, replaceState: true});
    };
    
    var listMade = $('.rm-list-ul', mB);
    var aRemoveMade = $('.remove-made', mB);

    $('.ready-made-bl .add-made', mB).click(function(){
        
        self.openLoadMade({ajaxSuccessSave: ajaxSuccessSave});
    });
    
    aRemoveMade.click(function(){
        
        listMade.trigger('remove-made');
    });


    listMade.on('click.selectA', function(event, data){
        var el = $(this);
        var ela = $(event.target);
        
        if(!ela.is('a'))
            return;

        var madeId = ela.data('made-id');
        var isSel = ela.hasClass('__selected');

        el.trigger('unSelectA');
        
        ela.addClass('__selected');

        aRemoveMade.addClass('__visible');
        
        if(isSel && madeId) {

            self.openLoadMade({
                madeId: madeId,
                ajaxSuccessSave: ajaxSuccessSave
            });
            return;
        }

    }).on('unSelectA', function(event, d){
        var el = $(this);
        var d = d || {};
        var e = event;
        var ela = $(e.target);

        $('.__selected', el).removeClass('__selected');

    }).on('remove-made', function(event, d){
        var el = $(this);
        var d = d || {};
        //var e = event;
        //var ela = $(e.target);
        
        var sel = $('.__selected', el);
        var madeId = sel.data('made-id');

        if(!madeId)
            return;
        
        self.removeMades({madeId: madeId});
        

        sel.parent().remove();
        aRemoveMade.removeClass('__visible');
    });
};

Classification_Subsystem_ReadyMade.prototype.removeMades = function(obj) {
    var self = this;
    var obj = obj || {};

    var sendAjData = [
        {name: "remove", value: 1},
        {name: "id_made", value: obj.madeId}
    ];

    var url = self.pluginKodObj['siteUrl'];

    $.ajax({
        url: url +'doc/ready-made',
        type: 'POST',
        data: sendAjData,
        dataType : 'json',
        error: self.ajaxError,
        //complete: function(){},
        success: function(data, textStatus, jqXHR) {

            var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

            if(!emptyReply)
                return;
            
            var hr = url +'ready-made/';

            $(window).trigger('loadAjaxData', {href: hr, replaceState: true});
        }
    });
};

Classification_Subsystem_ReadyMade.prototype.openLoadMade = function(obj) {
    var self = this;
    var obj = obj || {};
    var madeId = obj.madeId;
    var ajaxSuccessSave = obj.ajaxSuccessSave;

    var workAddMade = function(obj) {
        var obj = obj || {};
        var mB = $(obj.mB);

        if(mB.length < 1)
            return;

        var parentDialog = mB.data('parentDialog');
        var parrDialog = parentDialog.parent();

        var readyMadeForm = $(document.forms['ready-made-add']);

        $('button.closeDialog', mB).click(function(){

            parentDialog.dialog('close');
        });

        self.parenTBlKClassificators({
            mB: mB,
            editing: true,
            noScrollTo: true
        });

        self.hotValidInput({
            form: readyMadeForm
        });

        readyMadeForm.trigger('form-check');

        readyMadeForm.submit(function(event){

            event.preventDefault ? event.preventDefault() : (event.returnValue = false);

            var jqForm = $(this);
            var submitBut = $('button[type="submit"]', jqForm);
                submitBut.attr('disabled', true);

            var attrAction = jqForm.attr('action');

            var sendAjData = jqForm.serializeArray();

            $.ajax({
                url: attrAction,
                type: 'POST',
                data: sendAjData,
                dataType : 'json',
                error: self.ajaxError,
                complete: function(){

                    window.setTimeout(function(){

                        submitBut.attr('disabled', false);
                    }, 800);
                },
                success: function(data, textStatus, jqXHR) {

                    var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                    if(!emptyReply)
                        return;
                    
                    if(ajaxSuccessSave)
                        ajaxSuccessSave.apply(self, Array.prototype.slice.call(arguments));

                    if(parentDialog)
                        parentDialog.dialog('close');
                }
            });

        });
        
    };

    self.openjQueryDialog({
        title: self.i18n('Set up a set of classifier values'),
        spinner: true,
        dialogClass: 'add-made-dialog',
        openCallBack: function() {
            var initDialog = $(this);

            var url = self.pluginKodObj['siteUrl'];
                url += 'ready-made/ready-made-add';

            if(madeId)
                url += '?id='+ madeId;

            $.ajax({
                url: url,
                type: 'GET',
                data: {},
                dataType : 'HTML',
                error: self.ajaxError,
                //complete: function(){},
                success: function(data, textStatus, jqXHR) {

                    var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                    if(!emptyReply)
                        return;

                    var dataHtml = $(data);
                        dataHtml.data('parentDialog', initDialog);
                        dataHtml.css('opacity', 0);

                    window.setTimeout(function(){

                        initDialog.html(dataHtml);
                        initDialog.trigger('recenterPercent', {centered: true});
                        
                        var madeAddb = $('.ready-made-add', initDialog);
                    
                        workAddMade({mB: madeAddb});

                        dataHtml.animate({opacity: 1});
                    }, 1000);
                }
            });
        }
    });
    
};
//
//

Classification_Subsystem_Reports_Fiter.prototype.reportDialogFilter = function(obj) {
    var self = this;
    var obj = obj || {};
    var mB = $(obj.mB);

    var dialogClass = obj.dialogClass || '';
    var url = obj.url;

    if(!url)
        return;

    self.openjQueryDialog({
        title: self.i18n('Filter'),
        spinner: true,
        dialogClass: 'filter-type-n '+ dialogClass,
        openCallBack: function() {
            var initDialog = $(this);

            $.ajax({
                url: url,
                type: 'GET',
                data: {},
                dataType : 'HTML',
                error: self.ajaxError,
                //complete: function(){},
                success: function(data, textStatus, jqXHR) {

                    var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                    if(!emptyReply)
                        return;

                    var dataHtml = $(data);
                        dataHtml.data('parentDialog', initDialog);
                        dataHtml.css('opacity', 0);

                    window.setTimeout(function(){

                        initDialog.html(dataHtml);
                        initDialog.trigger('recenterPercent', {centered: true});

                        dataHtml.animate({opacity: 1});
                    }, 1000);
                }
            });
        }
    });
};

Classification_Subsystem_Reports_Fiter.prototype.autoLoadDialogFilter = function(obj) {
    var self = this;
    var obj = obj || {};
    var el = $(obj.el);

    if(el.length < 1)
        return;

    var locSearch = location.search || '';

    if(locSearch.indexOf('opfi=') < 0)
        return;

    var iterval = window.setInterval(function(){

        var sd = document.readyState;
        
        if(sd === 'loading')
            return;

        window.clearInterval(iterval);
        
        el.click();

    }, 100);
};

Classification_Subsystem_Reports_Fiter.prototype.classifierEls = function(obj) {
    var self = this;
    var obj = obj || {};
    var mB = $(obj.mB);
    
    if(mB.length < 1)
        return;

    var parentDialog = mB.data('parentDialog');
    var parrDialog = parentDialog.parent();

    var classifsItm = $('.classifs-itm', mB);
    
    var inputVcur = $('input.vcur', mB);

    var closeClickA = $('.ui-dialog-titlebar a.closeDialog', parrDialog);
        closeClickA.data('closeback', function(closeel){
            
            if(!closeel)
                return;

            var isVisb = closeel.is(':visible');

            if(isVisb) {

                closeel.trigger('hide-b');
                return true;
            }
        });

    classifsItm.on('show-b', function(e, d){
        var el = $(this);
        var d = d || {};
        
        closeClickA.data('closeel', el);

        el.data('workBlock', d.workBlock);
        el.fadeIn(200);

    }).on('hide-b', function(){
        var el = $(this);
        var d = d || {};

        el.removeAttr('style');
        el.removeData('workBlock');

    }).on('restore-val', function(e, d){
        var el = $(this);
        var d = d || {};
        var inp = $(d.input);

        if(inp.length < 1)
            return;
        
        var inpParr = inp.parent();
        var inpHidden = $('input[type="hidden"]', inpParr);
        var vhi = inpHidden.val() || '';

        $('.__selected', el).removeClass('__selected');

        if(vhi === '')
            return;
        
        var as = $('a[data-id="'+ vhi +'"]', el);

        as.addClass('__selected');
        
        $('.lst', el).scrollTo(as, {/* duration: 480,*/ axis: 'y'});
    });
    
    
    classifsItm.click(function(e){
        var t = $(this);
        var targ = $(e.target);
        var workBlock = t.data('workBlock');

        if(targ.is('span'))
            targ = targ.parent('a');

        if(!workBlock)
            return false;

        if(targ.hasClass('cur-itm')) {
            var id = targ.data('id');
            var isSele = targ.hasClass('__selected');

            if(isSele) {

                $('.icon-cross.cle', workBlock).click();

                targ.removeClass('__selected');
            } else {

                targ.addClass('__selected');

                var text = $('.v1', targ).text();
                    text += ' '+ $('.s-login2', targ).text();

                $('input.vcur', workBlock).trigger('insert-val', {
                    id: id,
                    text: text
                });
            }

            t.trigger('hide-b');

            return false;
        }

        return false;
    });


    inputVcur.on('insert-val', function(e, d){
        var el = $(this);
        var parr = el.parent();
        var d = d || {};

        el.prop('value', d.text ? d.text : '');

        $('input[data-required]', parr).trigger('val-change', {val: d.id});
    });
    
    inputVcur.click(function(){
        var el = $(this);
        var parr = el.parent();
        var label = parr.parent();

        var clait = $('.classifs-itm', label);

        clait.trigger('show-b', {workBlock: parr});
        clait.trigger('restore-val', {input: el});
    });

    $('.empty-result', mB).click(function(){
        var el = $(this);

        el.removeClass('__visible');
    });
};


Classification_Subsystem_Reports_Fiter.prototype.filterType4 = function(obj) {
    var self = this;
    var obj = obj || {};
    var mB = $(obj.mB);
    
    if(mB.length < 1)
        return;
    
    $('.table-report .show-demand', mB).click(function(){
        var el = $(this);
        var idDemand = el.data('id-demand');

        self.openjQueryDialog({
            title: self.i18n('View full requirements'),
            spinner: true,
            dialogClass: 'report-part-text',
            openCallBack: function() {
                var initDialog = $(this);

                var url = self.pluginKodObj['siteUrl'];

                var ajUrl = url;
                    ajUrl += 'reports/part-text';
                    ajUrl += '?id='+ idDemand;

                if(self.partTextAJAX) {

                    self.partTextAJAX.abort();
                    self.partTextAJAX = null;
                }

                self.partTextAJAX = $.ajax({
                    url: ajUrl,
                    type: 'GET',
                    //data: sendAjData,
                    dataType : 'html',
                    error: self.ajaxError,
                    complete: function(){

                        self.partTextAJAX = null;
                    },
                    success: function(data, textStatus, jqXHR) {

                        var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                        if(!emptyReply)
                            return;

                        var dataHtml = $(data);
                            dataHtml.data('parentDialog', initDialog);
                            dataHtml.css('opacity', 0);

                        window.setTimeout(function(){

                            initDialog.html(dataHtml);
                            initDialog.trigger('recenterPercent', {centered: true});

                            dataHtml.animate({opacity: 1});
                        }, 1000);
                        
                    }
                });
            }
        });

    });
    

    $('.doc-list .filter-icon', mB).click(function(){
        var el = $(this);
        var urlFilter = el.data('url-filter');

        if(!urlFilter)
            return;

        self.reportDialogFilter({
            url: urlFilter,
            dialogClass: 'filter-type-4'
        });
    });
    
};

Classification_Subsystem_Reports_Fiter.prototype.workFilterType4 = function(obj) {
    var self = this;
    var obj = obj || {};
    var mB = $(obj.mB);
    
    if(mB.length < 1)
        return;
            
    var parentDialog = mB.data('parentDialog');
    
    var repT4Form = $(document.forms['reports-type-4-filter']);

    
    $('button.closeDialog', mB).click(function(){

        parentDialog.dialog('close');
    });
    
    self.parenTBlKClassificators({
        mB: mB,
        editing: true,
        noScrollTo: true
    });
    

    self.hotValidInput({
        form: repT4Form
    });
    
    repT4Form.on('click', function(e){
        var el = $(this);
        var ela = $(e.target);

        if(!ela.is('input'))
            return;

        var li = ela.parents('li.doc-list-li');
        var isCheck = ela.prop('checked');

        li.toggleClass('selected', isCheck);
    });
    
    $('.empty-result', mB).click(function(){
        var el = $(this);

        el.removeClass('__visible');
    });

    
    repT4Form.submit(function(event){

        event.preventDefault ? event.preventDefault() : (event.returnValue = false);

        var jqForm = $(this);
        var submitBut = $('button[type="submit"]', jqForm);
            submitBut.attr('disabled', true);

        var attrAction = jqForm.attr('action');
        
        jqForm.trigger('form-check', {startSubmit: true});
        
        var invalid = $('.__invalid', jqForm);

        if(invalid.length > 0) {
            
            // Временно. Только для средства отладки
            alert('No service attributes-2');

            submitBut.removeAttr('disabled');
            return false;
        }

        var sendAjData = jqForm.serializeArray();

        if((!sendAjData) || (sendAjData.length < 1))
            return false;

        if(self.AJAXProcess != null)
            self.AJAXProcess.abort();

        self.AJAXProcess = $.ajax({
            url: attrAction,
            type: 'POST',
            data: sendAjData,
            dataType : 'json',
            error: self.ajaxError,
            complete: function(){


                window.setTimeout(function(){

                    submitBut.removeAttr('disabled');
                }, 1000);
            },
            success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;
                
                if(data.count < 1) {
                    
                    $('.empty-result', mB).addClass('__visible');

                    return;
                }

                if(!data.filterid)
                    return;


                if(parentDialog)
                    parentDialog.dialog('close');


                var locSearch = location.search || '';

                //var filterid = locSearch.indexOf('?') > -1 ? '&' : '?';
                //    filterid += 'filterid='+ data.filterid;
                
                var filterid = '?filterid='+ data.filterid;;

                var url = location.pathname /* +''+ locSearch */ + filterid;

                $(window).trigger('loadAjaxData', {href: url});
            }
        });
        
    });


};


Classification_Subsystem_Reports_Fiter.prototype.filterType1 = function(obj) {
    var self = this;
    var obj = obj || {};
    var mB = $(obj.mB);
    
    if(mB.length < 1)
        return;


    $('.doc-list .filter-icon', mB).click(function(){
        var el = $(this);
        var urlFilter = el.data('url-filter');

        if(!urlFilter)
            return;

        self.reportDialogFilter({
            url: urlFilter,
            dialogClass: 'filter-type-1'
        });
    });
    
};

Classification_Subsystem_Reports_Fiter.prototype.workFilterType1 = function(obj) {
    var self = this;
    var obj = obj || {};
    var mB = $(obj.mB);
    
    if(mB.length < 1)
        return;

    var repT1Form = $(document.forms['reports-type-1-filter']);

    var parentDialog = mB.data('parentDialog');

    $('button.closeDialog', mB).click(function(){

        parentDialog.dialog('close');
    });
    
    $('input[autofocus]', repT1Form).focus();

    self.hotValidInput({
        form: repT1Form
    });
    
    self.classifierEls({
        mB: mB
    });


    repT1Form.submit(function(event){

        event.preventDefault ? event.preventDefault() : (event.returnValue = false);

        var jqForm = $(this);
        var submitBut = $('button[type="submit"]', jqForm);
            submitBut.attr('disabled', true);

        var attrAction = jqForm.attr('action');
       
        jqForm.trigger('form-check', {startSubmit: true});
        
        var invalid = $('.__invalid', jqForm);

        if(invalid.length > 0) {

            //Временно. Только для средства отладки
            alert('No service attributes-2');

            return;
        }

        var sendAjData = jqForm.serializeArray();

        if((!sendAjData) || (sendAjData.length < 1))
            return false;

        $.ajax({
            url: attrAction,
            type: 'POST',
            data: sendAjData,
            dataType : 'json',
            error: self.ajaxError,
            complete: function(){


                window.setTimeout(function(){

                    submitBut.removeAttr('disabled');
                }, 1000);
            },
            success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;
                
                if(data.count < 1) {
                    
                    $('.empty-result', mB).addClass('__visible');

                    return;
                }

                if(!data.filterid)
                    return;

                if(parentDialog)
                    parentDialog.dialog('close');

                var locSearch = location.search || '';

                //var filterid = locSearch.indexOf('?') > -1 ? '&' : '?';
                //    filterid += 'filterid='+ data.filterid;

                var filterid = '?filterid='+ data.filterid;;

                var url = location.pathname + filterid;

                $(window).trigger('loadAjaxData', {href: url});
            }
        });

    });

};


Classification_Subsystem_Reports_Fiter.prototype.filterType2 = function(obj) {
    var self = this;
    var obj = obj || {};
    var mB = $(obj.mB);

    if(mB.length < 1)
        return;

    $('.doc-list .filter-icon', mB).click(function(){
        var el = $(this);
        var urlFilter = el.data('url-filter');

        if(!urlFilter)
            return;

        self.reportDialogFilter({
            url: urlFilter,
            dialogClass: 'filter-type-2'
        });
    });
};

Classification_Subsystem_Reports_Fiter.prototype.workFilterType2 = function(obj) {
    var self = this;
    var obj = obj || {};
    var mB = $(obj.mB);
    
    if(mB.length < 1)
        return;

    var repT1Form = $(document.forms['reports-type-2-filter']);

    var parentDialog = mB.data('parentDialog');

    $('button.closeDialog', mB).click(function(){

        parentDialog.dialog('close');
    });
    
    $('input[autofocus]', repT1Form).focus();

    self.hotValidInput({
        form: repT1Form
    });

    self.classifierEls({
        mB: mB
    });


    repT1Form.submit(function(event){

        event.preventDefault ? event.preventDefault() : (event.returnValue = false);

        var jqForm = $(this);
        var submitBut = $('button[type="submit"]', jqForm);
            submitBut.attr('disabled', true);

        var attrAction = jqForm.attr('action');
       
        jqForm.trigger('form-check', {startSubmit: true});

        var invalid = $('.__invalid', jqForm);

        if(invalid.length > 0) {

            //Временно. Только для средства отладки
            alert('No service attributes-2');

            return;
        }

        var sendAjData = jqForm.serializeArray();

        if((!sendAjData) || (sendAjData.length < 1))
            return false;

        $.ajax({
            url: attrAction,
            type: 'POST',
            data: sendAjData,
            dataType : 'json',
            error: self.ajaxError,
            complete: function(){


                window.setTimeout(function(){

                    submitBut.removeAttr('disabled');
                }, 1000);
            },
            success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;
                
                if(data.count < 1) {
                    
                    $('.empty-result', mB).addClass('__visible');

                    return;
                }

                if(!data.filterid)
                    return;

                if(parentDialog)
                    parentDialog.dialog('close');

                var locSearch = location.search || '';

                //var filterid = locSearch.indexOf('?') > -1 ? '&' : '?';
                //    filterid += 'filterid='+ data.filterid;

                var filterid = '?filterid='+ data.filterid;;

                var url = location.pathname + filterid;

                $(window).trigger('loadAjaxData', {href: url});
            }
        });

    });

};

Classification_Subsystem_Reports_Fiter.prototype.filterType3 = function(obj) {
    var self = this;
    var obj = obj || {};
    var mB = $(obj.mB);

    if(mB.length < 1)
        return;
    
    var filterIcon = $('.doc-list .filter-icon', mB);

    filterIcon.click(function(){
        var el = $(this);
        var urlFilter = el.data('url-filter');

        if(!urlFilter)
            return;

        self.reportDialogFilter({
            url: urlFilter,
            dialogClass: 'filter-type-3'
        });
    });
};


Classification_Subsystem_Reports_Fiter.prototype.workFilterType3 = function(obj) {
    var self = this;
    var obj = obj || {};
    var mB = $(obj.mB);
    
    if(mB.length < 1)
        return;
            
    var parentDialog = mB.data('parentDialog');
    
    var repT3Form = $(document.forms['reports-type-3-filter']);

    
    $('button.closeDialog', mB).click(function(){

        parentDialog.dialog('close');
    });
    
    self.parenTBlKClassificators({
        mB: mB,
        editing: true,
        noScrollTo: true
    });
    

    self.hotValidInput({
        form: repT3Form
    });
    
    repT3Form.on('click', function(e){
        var el = $(this);
        var ela = $(e.target);

        if(!ela.is('input'))
            return;

        var li = ela.parents('li.doc-list-li');

        if(li.length < 1)
            return;
        
        var ul = li.parent();

        $('.selected', ul).removeClass('selected');
        
        var isCheck = ela.prop('checked');

        li.toggleClass('selected', isCheck);
    });
    
    $('.empty-result', mB).click(function(){
        var el = $(this);

        el.removeClass('__visible');
    });

    
    repT3Form.submit(function(event){

        event.preventDefault ? event.preventDefault() : (event.returnValue = false);

        var jqForm = $(this);
        var submitBut = $('button[type="submit"]', jqForm);
            submitBut.attr('disabled', true);

        var attrAction = jqForm.attr('action');
        
        jqForm.trigger('form-check', {startSubmit: true});
        
        var invalid = $('.__invalid', jqForm);

        if(invalid.length > 0) {
            
            // Временно. Только для средства отладки
            alert('No service attributes-2');

            submitBut.removeAttr('disabled');
            return false;
        }

        var sendAjData = jqForm.serializeArray();

        if((!sendAjData) || (sendAjData.length < 1))
            return false;

        if(self.AJAXProcess != null)
            self.AJAXProcess.abort();

        self.AJAXProcess = $.ajax({
            url: attrAction,
            type: 'POST',
            data: sendAjData,
            dataType : 'json',
            error: self.ajaxError,
            complete: function(){


                window.setTimeout(function(){

                    submitBut.removeAttr('disabled');
                }, 1000);
            },
            success: function(data, textStatus, jqXHR) {

                var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

                if(!emptyReply)
                    return;
                
                if(data.count < 1) {
                    
                    $('.empty-result', mB).addClass('__visible');

                    return;
                }

                if(!data.filterid)
                    return;


                if(parentDialog)
                    parentDialog.dialog('close');


                var locSearch = location.search || '';

                //var filterid = locSearch.indexOf('?') > -1 ? '&' : '?';
                //    filterid += 'filterid='+ data.filterid;
                
                var filterid = '?filterid='+ data.filterid;;

                var url = location.pathname /* +''+ locSearch */ + filterid;

                $(window).trigger('loadAjaxData', {href: url});
            }
        });
        
    });

};//
//


Classification_Subsystem_Tabs.prototype.eventAddLoad = function(obj) {
    var self = this;
    var obj = obj || {};
    var els = obj['els'];

    if(!els)
        return;

    $(els).click(function(event){

        $(window).trigger('loadAjaxData', {el: this, event: event});
        
        return false;
    });
};


Classification_Subsystem_Tabs.prototype.loadAjaxData = function(event, data) {
    var d = data || {};
    var dEvt = d.event;
    var dEl = $(d.el);
    var subSys = event.data.ClassSubM;

    if(dEvt)
        dEvt.preventDefault ? dEvt.preventDefault() : (dEvt.returnValue = false);

    if(dEl.length > 0) {

        d['xhr-tabs'] = dEl.data('xhr-tabs');
        d['href'] = dEl.attr('href');
    }

    delete d['event'];
    delete d['el'];

    subSys.loadTabs(d);
};

Classification_Subsystem_Tabs.prototype.loadTabs = function(obj) {
    var self = this;
    var obj = obj || {};

    var attrxhrTabs = obj['xhr-tabs'] || 'main-tabs';
    var attrHref = obj['href'];

    if((!attrxhrTabs) || (!attrHref))
        return false;

    var isActSpinner = self.spinnerPreLoadTabs(obj);

    var insertReply = function(data, jqXHR){

        var currInsert = $('[data-tabs="'+ attrxhrTabs +'"]');

        var converHTML = $(data);

        self.eventAddLoad({
            els: $('a[data-xhr-tabs]', converHTML)
        });

        self.saveScrollHistory({
            els: $('*[data-rest-scroll]', converHTML)
        });

        currInsert.html(converHTML);
    };

    var sendAjData = {};

    if(self.currentAJAX != null)
        self.currentAJAX.abort();

    self.currentAJAX = $.ajax({
        url: attrHref,
        type: 'GET',
        //cache: false,
        data: sendAjData,
        headers: {
            Accept: 'text/html;q=0.9'
        },
        dataType : 'html',
        error: function(jqXHR, textStatus, errorThrown) {

            if((!jqXHR) || (!jqXHR.responseText)) {

                self.ajaxError.apply(self, Array.prototype.slice.call(arguments));
                return;
            }

            insertReply(jqXHR.responseText, jqXHR);
        },
        beforeSend: function() {

            self.headerResize();
            
            if(!obj['popstate']) {
                
                var replState = obj.replaceState === true;
                
                if(replState)
                    delete obj.replaceState;

                replState ?
                self.replaceState(obj, null, attrHref) :
                self.pushState(obj, null, attrHref);
            }
        },
        complete: function(jqXHR, textStatus){

            if(isActSpinner)
                isActSpinner.click();

            if(obj['popstate'])
                self.restoreScroll();
        },
        success: function(data, textStatus, jqXHR) {

            var emptyReply = self.ajaxSuccessEmpty.apply(self, Array.prototype.slice.call(arguments));

            if(!emptyReply)
                return;

            insertReply(data, jqXHR);
        }
    });        

};

Classification_Subsystem_Tabs.prototype.spinnerPreLoadTabs = function(obj) {
    var self = this;
    var obj = obj || {};
    var insertSpinner = obj['insertSpinner'];
    var notScrolling = obj['notScrolling'];

    if(!insertSpinner)
        insertSpinner = $('.wrapper .bg_pattern .main-cnt .scroll_cnt');
    

    var isActSpinner = insertSpinner.children('.global-spinner');


    if(isActSpinner.length > 0)
        return isActSpinner;


    var scrollHeight = insertSpinner.prop('scrollHeight');
    var clientHeight = insertSpinner.prop('clientHeight');


    var uniqid = self.uniqid({'pointCheck': true});

    var spinnerM = $('.__hidden .pieces-tmpl .global-spinner').clone();

    spinnerM.attr('data-spinner-id', uniqid);
    spinnerM.addClass('__active');

    spinnerM.click(function(){
        var ccDiv = $(this);

        if(self.currentAJAX != null)
            self.currentAJAX.abort();

        ccDiv.fadeOut({
            'duration': 300,
            'always': function(){
                
                insertSpinner.removeClass('overflow-hidden spinner-inside');
                ccDiv.remove();
            }
        });
    });

    insertSpinner.addClass('spinner-inside');


    if((!notScrolling) && (scrollHeight > clientHeight))
        insertSpinner.addClass('overflow-hidden');


    insertSpinner.prepend( spinnerM );

    var newSpin = $('div[data-spinner-id="'+ uniqid +'"]', insertSpinner);

    return newSpin;
};

Classification_Subsystem_Tabs.prototype.headerResize = function(obj) {
    var self = this;
    var obj = obj || {};
    var resizeBlock = $('.wrapper.header-start .header');
    
    if(resizeBlock.length < 1)
        return;
    
    var othParr = {
        always: function() {
            var el = $(this);
            var rm = $('.wrapper.header-start');

            rm.removeClass('header-start');

            window.setTimeout(function(){

                el.removeAttr('style');
            }, 100);
        }
    };

    resizeBlock.animate({height: '8.357em'}, othParr);
};

Classification_Subsystem_Tabs.prototype.saveScrollHistory = function(obj) {
    var self = this;
    var obj = obj || {};
    var els = obj['els'];

    if(!els)
        return;

    $(els).scroll(function(e){
        var el = $(this);

        /*
         * https://stackoverflow.com/questions/9144560/jquery-scroll-detect-when-user-stops-scrolling
         */

        window.clearTimeout( $.data(this, 'scrollTimer') );

        $.data(this, 'scrollTimer', window.setTimeout(function() {

            el.removeData('scrollTimer');

            var scLeft = el.scrollLeft();
            var scTop = el.scrollTop();
            var restScroll = el.data('rest-scroll');

            if(!restScroll)
                return;

            self.scrollToHistory({
                restScroll: restScroll,
                x: scLeft,
                y: scTop
            });

        }, 150));

    });
};//
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
//
//

var ClassSubM = new Classification_Subsystem_Main();


$(document).ready(function() {

    ClassSubM.init();
    ClassSubM.historyInit();
    
    ClassSubM.emulationHistoryButtons({context: $('.header .header_top .header-top-left')});

    $(window).on('loadAjaxData', {'ClassSubM': ClassSubM}, ClassSubM.loadAjaxData);

    ClassSubM.eventAddLoad({
        els: $('body .wrapper a[data-xhr-tabs]')
    });

    ClassSubM.saveScrollHistory({
        els: $('body .wrapper *[data-rest-scroll]')
    });
    

    $(window).on('resize', function () {

        if(window.WebuiPopovers)
            WebuiPopovers.hideAll();
    });
});
