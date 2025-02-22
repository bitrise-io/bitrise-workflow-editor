import './_BitriseWorkflowEditor';
import './_apihandler';
import './_componentRegister';
import './_serviceRegister';

import '../stylesheets/main.css';

const ctxs = [
  // app
  require.context('./controllers', true),
  require.context('./components', true),
  require.context('./services', true),
  require.context('./directives', true),
];

ctxs.forEach(function (ctx) {
  ctx.keys().forEach(ctx);
});
