import { SUPPORTED_API_VERSIONS, type ApiVersion } from "@phala/cloud";

let apiVersionOverride: ApiVersion | undefined;

export function isValidApiVersion(value: string): value is ApiVersion {
	return (SUPPORTED_API_VERSIONS as readonly string[]).includes(value);
}

export function setApiVersionOverride(version: ApiVersion | undefined): void {
	apiVersionOverride = version;
}

export function getApiVersionOverride(): ApiVersion | undefined {
	return apiVersionOverride;
}
