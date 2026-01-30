/**
 * @deprecated
 * This file previously managed ~/.phala-cloud/config.json.
 *
 * The CLI no longer reads that file. Use `utils/state.ts` instead.
 */

import {
	getStateValue,
	listStateValues,
	loadState,
	saveState,
	setStateValue,
	type State,
} from "./state";

type ConfigValue = string | number | boolean | null | undefined;
type Config = Record<string, ConfigValue>;

export function loadConfig(): Config {
	return loadState() as Config;
}

export function saveConfig(config: Config): void {
	saveState(config as State);
}

export function getConfigValue(key: string): ConfigValue {
	return getStateValue(key) as ConfigValue;
}

export function setConfigValue(key: string, value: ConfigValue): void {
	setStateValue(key, value);
}

export function listConfigValues(): Config {
	return listStateValues() as Config;
}
