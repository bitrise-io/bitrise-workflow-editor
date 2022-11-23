import { dump, JSON_SCHEMA } from "js-yaml";
import { AppConfig } from "../models/AppConfig";

export default function appConfigAsYml(appConfig: AppConfig | undefined): string {
	if (!appConfig) {
		return "";
	}

	if (typeof appConfig === "string") {
		return appConfig;
	}

	return dump(appConfig, { noArrayIndent: true, schema: JSON_SCHEMA , sortKeys: true });
}
