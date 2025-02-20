import './_BitriseWorkflowEditor';
import './_apihandler';
import './_componentRegister';
import './_serviceRegister';

import '../index.slim';
import '../stylesheets/main.css';

const ctxs = [
  // app
  require.context('./controllers', true),
  require.context('./components', true),
  require.context('./services', true),
  require.context('./directives', true),

  // templates
  require.context('../templates', true, /^[^_].*\.slim$/),
];

ctxs.forEach(function (ctx) {
  ctx.keys().forEach(ctx);
});
