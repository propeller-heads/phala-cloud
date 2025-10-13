export function toCamelCase(value: string): string {
	return value
		.split(/[\s-]+/)
		.filter(Boolean)
		.map((segment, index) => {
			if (index === 0) {
				return segment.toLowerCase();
			}
			return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
		})
		.join("");
}

export function ensureArray<T>(value: T | readonly T[] | undefined): T[] {
	if (value === undefined) {
		return [];
	}
	if (Array.isArray(value)) {
		return [...value] as T[];
	}
	return [value as T];
}
