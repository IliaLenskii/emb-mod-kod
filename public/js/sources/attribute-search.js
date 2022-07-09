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

};