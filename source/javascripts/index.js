import "./_BitriseWorkflowEditor.js.erb";
import "./_apihandler.js.erb";
import "./_componentRegister";
import "./_serviceRegister";

var ctxs = [
    // app
    require.context("./controllers", true),
    require.context("./components", true),
    require.context("./factories", true),
    require.context("./services", true),
    require.context("./filters", true),
    require.context("./directives", true),

    // templates
    require.context("../templates", true, /^[^_].*\.slim$/)
];

import "../index.slim";
import "../stylesheets/main.scss";

ctxs.forEach(function(ctx) {
    ctx.keys().forEach(ctx);
});
