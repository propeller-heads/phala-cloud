import type { ApiVersion } from "@phala/cloud";

let apiVersionOverride: ApiVersion | undefined;

export function setApiVersionOverride(version: ApiVersion | undefined): void {
	apiVersionOverride = version;
}

export function getApiVersionOverride(): ApiVersion | undefined {
	return apiVersionOverride;
}
