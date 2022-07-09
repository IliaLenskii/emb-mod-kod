$(document).ready(function() {
	$('.__js-tabs-i').click(function() {
		var tab = $(this).attr('id'),
			btns = $('.relative-tab'),
			targetBtn = '.' + tab;
		$('.__js-tabs-i').removeClass('__active').eq($(this).index()).addClass('__active');
		$(".__js-tabs-cnt").hide().eq($(this).index()).fadeIn();
		btns.removeClass('__active');
		$(targetBtn).addClass('__active');
	}).eq(0).addClass('__active');
	$(".__js-tabs-cnt").eq(0).show();

	$('.__js-check-stroke').click(function() {
		if ($(this).hasClass('__active')) {
            $(this).removeClass('__active');
			$('.draft').addClass('__disabled');
        }
        else{
            $('.__js-check-stroke').removeClass('__active').eq($(this).index()).addClass('__active');
			$('.draft').removeClass('__disabled');
        }
		return false;
	})
	$('.check-stroke').click(function() {
		if ($(this).hasClass('__active')) {
            $(this).removeClass('__active');
			$('.template').addClass('__disabled');
        }
        else{
			$('.check-stroke').removeClass('__active').eq($(this).index()).addClass('__active');
			$('.template').removeClass('__disabled');
		}
		return false;
	})
});