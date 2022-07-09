//
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
};