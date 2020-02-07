import { react2angular } from "react2angular";
import ErrorNotification from "./components/ErrorNotification";

var register = react2angular;

angular.module("BitriseWorkflowEditor")
    .component("errornotification", react2angular(ErrorNotification, ["message"]));