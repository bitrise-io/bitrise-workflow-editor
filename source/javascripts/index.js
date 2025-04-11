import './_BitriseWorkflowEditor';
import './_apihandler';
import './_componentRegister';
import './_serviceRegister';

import '../stylesheets/main.css';

import.meta.glob('./vendor.js', { eager: true });

const loadModules = async () => {
  await Promise.all([
    ...Object.values(import.meta.glob('./services/*.js')).map((load) => load()),
    ...Object.values(import.meta.glob('./components/*.js')).map((load) => load()),
    ...Object.values(import.meta.glob('./directives/*.js')).map((load) => load()),
  ]);

  await Promise.all(Object.values(import.meta.glob('./controllers/*.js')).map((load) => load()));
};

$(() => {
  loadModules().then(async () => {
    angular.bootstrap(document, ['BitriseWorkflowEditor']);
  });
});
