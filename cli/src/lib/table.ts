export type TableColumn = string;

export function printTable(
	columns: readonly TableColumn[],
	rows: readonly Record<TableColumn, string>[],
): void {
	const widths: Record<string, number> = {};
	for (const col of columns) {
		widths[col] = col.length;
		for (const row of rows) {
			widths[col] = Math.max(widths[col], (row[col] ?? "").length);
		}
	}

	const formatRow = (values: Record<string, string>) =>
		columns.map((col) => (values[col] ?? "").padEnd(widths[col])).join("  ");

	// header
	console.log(formatRow(Object.fromEntries(columns.map((c) => [c, c]))));
	for (const row of rows) {
		console.log(formatRow(row));
	}
}
