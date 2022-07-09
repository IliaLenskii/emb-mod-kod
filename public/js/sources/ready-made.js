//
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
