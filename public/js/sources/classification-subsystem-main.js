//
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

