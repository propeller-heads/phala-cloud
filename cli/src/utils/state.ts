import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type StateValue = string | number | boolean | null | undefined;
export type State = Record<string, StateValue>;

const DEFAULT_STATE: State = {};

function getPhalaCloudDir(): string {
	// NOTE: This is intentionally undocumented. It's used for testing and
	// controlled environments.
	const overridden = process.env.PHALA_CLOUD_DIR;
	if (typeof overridden === "string" && overridden.trim().length > 0) {
		return overridden;
	}
	return path.join(os.homedir(), ".phala-cloud");
}

export function getStateFilePath(): string {
	return path.join(getPhalaCloudDir(), "state.json");
}

function ensureDirectoryExists(): void {
	const dir = getPhalaCloudDir();
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

export function loadState(): State {
	try {
		const filePath = getStateFilePath();
		if (!fs.existsSync(filePath)) return DEFAULT_STATE;
		const raw = fs.readFileSync(filePath, "utf8");
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object") return DEFAULT_STATE;
		return parsed as State;
	} catch {
		return DEFAULT_STATE;
	}
}

export function saveState(values: State): void {
	ensureDirectoryExists();
	const merged = { ...loadState(), ...values };
	fs.writeFileSync(getStateFilePath(), JSON.stringify(merged, null, 2), {
		mode: 0o600,
		encoding: "utf8",
	});
}

export function getStateValue(key: string): StateValue {
	return loadState()[key];
}

export function setStateValue(key: string, value: StateValue): void {
	saveState({ [key]: value });
}

export function listStateValues(): State {
	return loadState();
}

export function removeStateKeys(keys: readonly string[]): void {
	const current = loadState();
	let changed = false;
	for (const key of keys) {
		if (key in current) {
			delete current[key];
			changed = true;
		}
	}
	if (!changed) return;
	ensureDirectoryExists();
	fs.writeFileSync(getStateFilePath(), JSON.stringify(current, null, 2), {
		mode: 0o600,
		encoding: "utf8",
	});
}
