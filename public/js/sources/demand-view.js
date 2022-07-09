/**
 * Режим просмотра требований/группировка текста требования #20444
 * @param main
 * @constructor
 */
function DemandView(main) {
    var self = this;
    this.main = main;
    this.containers = $('.view-mode');
    this.kdocContainer = $('.form-analysis-text-doc');
    this.currentMode = 1;

    this.containers.each(function () { self.init(this); });
}

/**
 * Иницилиазирует модуль
 * @param {HTMLElement} element
 */
DemandView.prototype.init = function (element) {
    var tooltip = this.main.createTooltip({target: $('.view-mode__icon', $(element)), content: $('.pieces-tmpl .template-view-mode').clone(), className: 'view-mode__tooltip', eventType: 'click'}),
        self = this;

    tooltip.on('click', 'li', function () {
        var $elem = $(this),
            mode = $elem.attr('data-mode');

        tooltip.hide();

        self.setMode(parseInt(mode));

        return false;
    });

    this.kdocContainer.on('click', function (e) {
       self.setMode(1);
    });
};


/**
 * Скрывает элемент управления режимами просмотра "глазик"
 */
DemandView.prototype.off = function () {
    this.containers.removeClass('view-mode_active');
    this.setMode(1);
};


/**
 * Показывает элемент управления режимами просмотра "глазик"
 */
DemandView.prototype.on = function () {
    this.containers.addClass('view-mode_active');
};


/**
 * Устанавливат режим отображения
 * @param mode - число режима отображения 1- видно всё, 2- только текст требования видно
 */
DemandView.prototype.setMode = function (mode) {
    this.currentMode = mode;
    this.containers.find('[data-mode]').removeClass('view-mode__item_active');
    this.containers.find('[data-mode=' + mode + ']').addClass('view-mode__item_active');

    switch (mode) {
        case 1:
            this.kdocContainer.removeClass('show-only-demand-text');
            break;
        case 2:
            this.kdocContainer.addClass('show-only-demand-text');
            break;
    }
};
