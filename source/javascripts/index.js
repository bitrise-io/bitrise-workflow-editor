require.context("./components", true);
require.context("./controllers", true);
require.context("./factories", true);
require.context("./services", true);
require.context("./filters", true);
require.context("./directives", true);

import "./_apihandler";
import "./_BitriseWorkflowEditor";

// include templatest
require.context("../templates", true, /^[^_].*\.slim$/);
