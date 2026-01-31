export type Result<T> =
	| { success: true; data: T }
	| { success: false; error: { message: string } };

export function isOk<T>(
	result: Result<T>,
): result is { success: true; data: T } {
	return result.success;
}

export function isErr<T>(
	result: Result<T>,
): result is { success: false; error: { message: string } } {
	return !result.success;
}
