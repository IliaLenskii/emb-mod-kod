//
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
};