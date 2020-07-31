import $ from "jquery";
import _ from "underscore";
import "whatwg-fetch";

global.$ = $;
global._ = _;

import "angular";
import "angular-cookies";
import "angular-sanitize";
import "angular-route";
import "angular-animate";
import "angular-elastic";

import "showdown";
import "ng-showdown";

import "esprima";

$(document).ready(function() {
	document.body.addEventListener("DOMSubtreeModified", function() {
		_.each($("*[sanitized-markdown] a[href]"), function(anAnchor) {
			$(anAnchor).attr("target", "_blank");
			$(anAnchor).attr("rel", "noreferrer noopener nofollow");
		});
	});
});
