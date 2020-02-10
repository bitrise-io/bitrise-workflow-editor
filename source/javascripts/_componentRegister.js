import { react2angular } from "react2angular";
import ErrorNotification from "./components/ErrorNotification";
import StepItem from "./components/StepItem/StepItem";

var register = react2angular;

angular.module("BitriseWorkflowEditor")
    .component("errornotification", register(ErrorNotification, ["message"]))
    .component("stepItem", register(StepItem, ["step", "strings", "selected", "stepIndex", "onSelected"]));
