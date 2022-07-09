//
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
};