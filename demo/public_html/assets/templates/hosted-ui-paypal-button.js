$('.pay-select__item').on('click', function() {
    $('.pay-select__item').removeClass('is-active');
    $(this).addClass('is-active');

    if ($(this).hasClass('pay-select--card')) {
        $('.select-body__content').removeClass('is-active');
        $('.select-body--card').addClass('is-active');
        $("body").trigger("cancel_paypal_payment");
    } else {
        $('.select-body__content').removeClass('is-active');
        $('.select-body--paypal').addClass('is-active');
    }
});