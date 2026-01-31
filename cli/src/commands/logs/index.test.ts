import {
	describe,
	test,
	expect,
	mock,
	beforeEach,
	afterEach,
	spyOn,
} from "bun:test";
import type { CommandContext } from "@/src/core/types";

type ContainerLogsOptions = {
	container?: string;
	since?: string;
	until?: string;
	tail?: number;
	timestamps?: boolean;
	matchContainerIdPrefix?: boolean;
};

type LogEntry = { channel: "stdout" | "stderr"; message: string };

const mockFetchContainerLogsEntries = mock(
	(_appId: string, _options: ContainerLogsOptions) =>
		Promise.resolve<LogEntry[]>([{ channel: "stdout", message: "hello\n" }]),
);

const mockStreamContainerLogsEntries = mock(
	(
		_appId: string,
		onEntry: (entry: LogEntry) => void,
		_options: ContainerLogsOptions,
		_signal?: AbortSignal,
	) => {
		onEntry({ channel: "stdout", message: "out\n" });
		onEntry({ channel: "stderr", message: "err\n" });
		return Promise.resolve();
	},
);

mock.module("@/src/api/cvms", () => ({
	fetchContainerLogsEntries: mockFetchContainerLogsEntries,
	streamContainerLogsEntries: mockStreamContainerLogsEntries,
}));

mock.module("@phala/cloud", () => ({
	CvmIdSchema: {
		parse: (input: unknown) => {
			const obj = input as { id?: string; app_id?: string };
			return { cvmId: obj.id ?? obj.app_id ?? "app_abc123" };
		},
	},
}));

mock.module("@/src/commands/cvms/logs-handler", () => ({
	checkAndWarnIfLogsDisabled: mock(() => Promise.resolve(false)),
}));

const noop = () => {};
mock.module("@/src/utils/logger", () => ({
	setJsonMode: noop,
	logger: {
		startSpinner: () => ({ stop: noop }),
		table: noop,
		info: noop,
		warn: noop,
		error: noop,
		success: noop,
		break: noop,
		logDetailedError: noop,
		debug: noop,
	},
}));

// Import after mocking
const { logsCommand } = await import("./index");

function makeContext(overrides: Partial<CommandContext> = {}): CommandContext {
	return {
		argv: [],
		rawFlags: {},
		rawPositionals: [],
		cwd: process.cwd(),
		env: process.env,
		stdout: process.stdout,
		stderr: process.stderr,
		stdin: process.stdin,
		projectConfig: {},
		success() {},
		fail() {},
		...overrides,
	};
}

describe("logs command", () => {
	let fakeStdout: { write: (s: string) => boolean };
	let fakeStderr: { write: (s: string) => boolean };
	let stdoutWriteSpy: ReturnType<typeof spyOn>;
	let stderrWriteSpy: ReturnType<typeof spyOn>;

	beforeEach(() => {
		mockFetchContainerLogsEntries.mockClear();
		mockStreamContainerLogsEntries.mockClear();

		fakeStdout = { write: () => true };
		fakeStderr = { write: () => true };
		stdoutWriteSpy = spyOn(fakeStdout, "write");
		stderrWriteSpy = spyOn(fakeStderr, "write");
	});

	afterEach(() => {
		stdoutWriteSpy.mockRestore();
		stderrWriteSpy.mockRestore();
	});

	test("returns 1 when no CVM ID provided", async () => {
		const failMessages: string[] = [];
		const code = await logsCommand.run(
			{
				containerName: "my-service",
				json: false,
				interactive: false,
				follow: false,
				timestamps: false,
				stdout: true,
				stderr: false,
			},
			makeContext({
				stdout: fakeStdout as unknown as NodeJS.WriteStream,
				stderr: fakeStderr as unknown as NodeJS.WriteStream,
				fail: (msg: string) => failMessages.push(msg),
			}),
		);

		expect(code).toBe(1);
		expect(failMessages[0]).toContain("No CVM ID");
	});

	test("fetches logs with container name only (no id prefix matching)", async () => {
		mockFetchContainerLogsEntries.mockResolvedValue([
			{ channel: "stdout", message: "hello\n" },
		]);

		const code = await logsCommand.run(
			{
				containerName: "my-service",
				json: false,
				interactive: false,
				follow: false,
				timestamps: false,
				stdout: true,
				stderr: false,
			},
			makeContext({
				cvmId: { id: "app_abc123" },
				stdout: fakeStdout as unknown as NodeJS.WriteStream,
				stderr: fakeStderr as unknown as NodeJS.WriteStream,
			}),
		);

		expect(code).toBe(0);
		expect(mockFetchContainerLogsEntries).toHaveBeenCalledTimes(1);
		const firstCall = mockFetchContainerLogsEntries.mock.calls[0] as
			| [string, ContainerLogsOptions]
			| undefined;
		expect(firstCall?.[1]).toMatchObject({
			container: "my-service",
			matchContainerIdPrefix: false,
		});
		expect(stdoutWriteSpy).toHaveBeenCalledWith("hello\n");
	});

	test("outputs logs as json", async () => {
		const successData: unknown[] = [];
		mockFetchContainerLogsEntries.mockResolvedValue([
			{ channel: "stdout", message: "hello\n" },
		]);

		const code = await logsCommand.run(
			{
				containerName: "my-service",
				json: true,
				interactive: false,
				follow: false,
				timestamps: false,
				stdout: true,
				stderr: false,
			},
			makeContext({
				cvmId: { id: "app_abc123" },
				stdout: fakeStdout as unknown as NodeJS.WriteStream,
				stderr: fakeStderr as unknown as NodeJS.WriteStream,
				success: (data: unknown) => successData.push(data),
			}),
		);

		expect(code).toBe(0);
		expect(successData).toHaveLength(1);
		const result = successData[0] as { logs?: string; cvm_id?: string };
		expect(result.logs).toBe("hello\n");
		expect(result.cvm_id).toBe("app_abc123");
	});

	test("rejects --json with --follow", async () => {
		const failMessages: string[] = [];
		const code = await logsCommand.run(
			{
				containerName: "my-service",
				json: true,
				interactive: false,
				follow: true,
				timestamps: false,
				stdout: true,
				stderr: false,
			},
			makeContext({
				cvmId: { id: "app_abc123" },
				stdout: fakeStdout as unknown as NodeJS.WriteStream,
				stderr: fakeStderr as unknown as NodeJS.WriteStream,
				fail: (msg: string) => failMessages.push(msg),
			}),
		);

		expect(code).toBe(1);
		expect(failMessages[0]).toContain("Cannot use --json with --follow");
	});

	test("streams logs and routes container stderr to stderr when --stderr is used", async () => {
		const code = await logsCommand.run(
			{
				containerName: "my-service",
				json: false,
				interactive: false,
				follow: true,
				timestamps: false,
				stdout: true,
				stderr: true,
			},
			makeContext({
				cvmId: { id: "app_abc123" },
				stdout: fakeStdout as unknown as NodeJS.WriteStream,
				stderr: fakeStderr as unknown as NodeJS.WriteStream,
			}),
		);

		expect(code).toBe(0);
		expect(mockStreamContainerLogsEntries).toHaveBeenCalledTimes(1);
		expect(stdoutWriteSpy).toHaveBeenCalledWith("out\n");
		expect(stderrWriteSpy).toHaveBeenCalledWith("err\n");
	});
});
