//= require _apihandler
//= require _BitriseWorkflowEditor
//= require_tree ./services/
//= require_tree ./factories/
//= require_tree ./filters/
//= require_tree ./components/
//= require_tree ./directives/
//= require_tree ./controllers/

// polyfill for IE
if (!Number.MAX_SAFE_INTEGER) {
    Number.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
}
