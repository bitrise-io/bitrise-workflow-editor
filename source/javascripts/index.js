require.context("./components", true);
require.context("./controllers", true);
require.context("./factories", true);
require.context("./services", true);
require.context("./filters", true);
require.context("./directives", true);

import "./_apihandler";
import "./_BitriseWorkflowEditor";

// include templates
require.context("../templates", true, /^[^_].*\.slim$/);


$(document).ready(function() {
    document.body.addEventListener('DOMSubtreeModified', function() {
        _.each($('*[sanitized-markdown] a[href]'), function(anAnchor) {
            $(anAnchor).attr('target', '_blank');
            $(anAnchor).attr('rel', 'noreferrer noopener nofollow');
        });
    });
});
