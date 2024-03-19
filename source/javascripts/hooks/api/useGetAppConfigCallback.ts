import { AppConfig } from "../../models/AppConfig";
import useMonolithApiCallback from "./useMonolithApiCallback";

const useGetAppConfigCallback = (appSlug: string) =>
  useMonolithApiCallback<AppConfig>(`/api/app/${appSlug}/config`);

export default useGetAppConfigCallback;
