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
};