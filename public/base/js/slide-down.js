$( document ).ready(function() {
    $('.__js-slide-down_h').click(function(event) {
        if ($(this).hasClass('__active')) {
            $(this).removeClass('__active');
            $(this).siblings('.__js-slide-down_tx').slideToggle();
        }
        else{
            $(this).addClass('__active')
            $(this).siblings('.__js-slide-down_tx').slideToggle();
        }
		return false;
    });
	$('.__js-ic-option').click(function(event) {
        if ($(this).hasClass('__active')) {
            $(this).removeClass('__active');
        }
        else{
            $(this).addClass('__active')
        }
		return false;
    });
});

