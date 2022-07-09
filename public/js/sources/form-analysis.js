//
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
};