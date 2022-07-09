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

};