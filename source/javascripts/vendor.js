import $ from 'jquery';
import _ from 'underscore';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'whatwg-fetch';
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';

import 'angular';
import 'angular-cookies';
import 'angular-sanitize';
import 'angular-route';
import 'angular-animate';
import 'angular-elastic';

import 'showdown';
import 'ng-showdown';

import 'esprima';

global.$ = $;
global._ = _;
window.$ = $;
window._ = _;

$(document).ready(function () {
  document.body.addEventListener('DOMSubtreeModified', function () {
    _.each($('*[sanitized-markdown] a[href]'), function (anAnchor) {
      $(anAnchor).attr('target', '_blank');
      $(anAnchor).attr('rel', 'noreferrer noopener nofollow');
    });
  });
});
