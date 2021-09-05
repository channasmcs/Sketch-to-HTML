/**
 *  slideNav listener function
 */
const openSpotModel = (
  $el_spotting_model,
  $el_sideNav,
  $el_body,
  class_hide,
  class_open
) => {
  if ($el_spotting_model.hasClass(class_hide)) {
    // open
    $el_spotting_model.removeClass(class_hide);
    setTimeout(() => {
      $el_sideNav.addClass(class_open);
      $el_body.addClass('overflow-hidden');
    }, 100);
  } else {
    // close
    setTimeout(() => {
      $el_sideNav.removeClass(class_open);
      $el_body.removeClass('overflow-hidden');
    }, 100);
    $el_spotting_model.addClass(class_hide);
  }
};

const applyErrorMsg = (data, parentEle, appendId, msg) => {
  if (data.length === 0) {
    parentEle.html('<span id="' + appendId + '"> ' + msg + '</span>');
  } else {
    $('#' + appendId).remove();
  }
};
