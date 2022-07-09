//
//

var ClassSubM = new Classification_Subsystem_Main();


$(document).ready(function() {

    ClassSubM.init();
    ClassSubM.historyInit();
    
    ClassSubM.emulationHistoryButtons({context: $('.header .header_top .header-top-left')});

    $(window).on('loadAjaxData', {'ClassSubM': ClassSubM}, ClassSubM.loadAjaxData);

    ClassSubM.eventAddLoad({
        els: $('body .wrapper a[data-xhr-tabs]')
    });

    ClassSubM.saveScrollHistory({
        els: $('body .wrapper *[data-rest-scroll]')
    });
    

    $(window).on('resize', function () {

        if(window.WebuiPopovers)
            WebuiPopovers.hideAll();
    });
});
