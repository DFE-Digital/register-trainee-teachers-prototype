/* global $ */

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

$(document).ready(function () {
  window.GOVUKFrontend.initAll()
  $(() => window.GOVUK.stickAtTopWhenScrolling.init());
  $(() => window.GOVUK.stickAtBottomWhenScrolling.init());
})

// Submit form when any change detected
$('.js-auto-submit').on('change', function(){
  $(this).closest('form').submit();
});


if ($('.js-bulk-menu').length){
  new MOJFrontend.ButtonMenu({
    container: $('.js-bulk-menu .moj-button-menu'),
    mq: '(min-width: 200em)',
    buttonText: 'Bulk record actions',
    buttonClasses: 'govuk-button--secondary moj-button-menu--secondary moj-button-menu__toggle-button--secondary',
    _menuClasses: 'moj-button-menu__wrapper--right'
  });
}

new MOJFrontend.ButtonMenu({
  container: $(".moj-button-menu"),
  mq: "(min-width: 200em)",
  buttonText: "Change attendance",
  buttonClasses:
    "govuk-button--secondary moj-button-menu__toggle-button--secondary"
});

$(document).ready(function () {
  initAutocompletes()
})
