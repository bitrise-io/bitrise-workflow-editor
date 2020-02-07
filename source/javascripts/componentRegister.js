import { react2angular } from 'react2angular'
import ErrorNotification from './components/ErrorNotification';


angular.module("BitriseWorkflowEditor")
    .component("error-notification", react2angular(ErrorNotification, ["message"]));