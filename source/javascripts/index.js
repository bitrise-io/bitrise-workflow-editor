import './_BitriseWorkflowEditor';
import './_apihandler';
import './_componentRegister';
import './_serviceRegister';

// Load styles
import '../stylesheets/main.css';

import.meta.glob('./vendor.js', { eager: true });

// Load Angular components in order
const loadModules = async () => {
  // Load services first
  await Promise.all(Object.values(import.meta.glob('./services/*.js')).map((load) => load()));

  // Then components
  await Promise.all(Object.values(import.meta.glob('./components/*.js')).map((load) => load()));

  // Then directives
  await Promise.all(Object.values(import.meta.glob('./directives/*.js')).map((load) => load()));

  // Controllers last
  await Promise.all(Object.values(import.meta.glob('./controllers/*.js')).map((load) => load()));
};

// Initialize after DOM is ready
global.$(() => {
  loadModules().then(() => {
    angular.bootstrap(document, ['BitriseWorkflowEditor']);
  });
});
