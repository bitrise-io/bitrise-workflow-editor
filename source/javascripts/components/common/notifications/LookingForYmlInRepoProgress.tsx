import { Notification } from "@bitrise/bitkit";
import { WFEWindow } from "../../../typings/global";

const LookingForYmlInRepoProgress = (): JSX.Element => (
	<Notification status="progress">{(window as WFEWindow).strings["yml"]["store_in_repository"]["loading"]}</Notification>
);

export default LookingForYmlInRepoProgress;
