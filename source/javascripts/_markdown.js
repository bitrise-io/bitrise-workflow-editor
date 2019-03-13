$(document).ready(function() {
  document.body.addEventListener('DOMSubtreeModified', function() {
    _.each($('*[sanitized-markdown] a[href]'), function(anAnchor) {
      $(anAnchor).attr('target', '_blank');
      $(anAnchor).attr('rel', 'noreferrer noopener nofollow');
    });
  });
});
