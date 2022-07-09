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
};