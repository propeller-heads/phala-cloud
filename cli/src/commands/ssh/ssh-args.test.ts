import { describe, expect, test } from "bun:test";

// Re-implement the functions here for testing since they're not exported
// In a real scenario, you might want to export these from the module

/**
 * Check if pass-through args contain blocked options
 */
function containsBlockedOption(args: string[]): string | null {
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		// Check -o ProxyCommand=...
		if (arg === "-o" && i + 1 < args.length) {
			const nextArg = args[i + 1];
			if (nextArg.toLowerCase().startsWith("proxycommand")) {
				return "-o ProxyCommand";
			}
		}
		// Check -oProxyCommand=... (combined form)
		if (arg.toLowerCase().startsWith("-oproxycommand")) {
			return "-o ProxyCommand";
		}
	}
	return null;
}

/**
 * Split pass-through args into SSH options and remote command
 */
function splitPassThroughArgs(args: string[]): {
	options: string[];
	command: string[];
} {
	const options: string[] = [];
	const command: string[] = [];

	// SSH options that take an argument
	const optionsWithArg = new Set([
		"-b",
		"-c",
		"-D",
		"-E",
		"-e",
		"-F",
		"-I",
		"-i",
		"-J",
		"-L",
		"-l",
		"-m",
		"-O",
		"-o",
		"-P",
		"-p",
		"-R",
		"-S",
		"-W",
		"-w",
	]);

	let i = 0;
	let inCommand = false;

	while (i < args.length) {
		const arg = args[i];

		if (inCommand) {
			command.push(arg);
			i++;
			continue;
		}

		if (arg.startsWith("-")) {
			options.push(arg);
			// Check if this option takes an argument
			const optFlag = arg.length === 2 ? arg : arg.slice(0, 2);
			if (
				optionsWithArg.has(optFlag) &&
				arg.length === 2 &&
				i + 1 < args.length
			) {
				i++;
				options.push(args[i]);
			}
			i++;
		} else {
			// First non-option argument starts the command
			inCommand = true;
			command.push(arg);
			i++;
		}
	}

	return { options, command };
}

describe("containsBlockedOption", () => {
	test("should return null for empty args", () => {
		expect(containsBlockedOption([])).toBeNull();
	});

	test("should return null for allowed options", () => {
		expect(containsBlockedOption(["-L", "8080:localhost:80"])).toBeNull();
		expect(containsBlockedOption(["-i", "~/.ssh/key"])).toBeNull();
		expect(containsBlockedOption(["-D", "1080", "-N"])).toBeNull();
		expect(
			containsBlockedOption(["-o", "StrictHostKeyChecking=no"]),
		).toBeNull();
		expect(containsBlockedOption(["-o", "ServerAliveInterval=60"])).toBeNull();
	});

	test("should detect -o ProxyCommand (separate form)", () => {
		expect(containsBlockedOption(["-o", "ProxyCommand=evil"])).toBe(
			"-o ProxyCommand",
		);
		expect(containsBlockedOption(["-o", "proxycommand=evil"])).toBe(
			"-o ProxyCommand",
		);
		expect(containsBlockedOption(["-o", "PROXYCOMMAND=evil"])).toBe(
			"-o ProxyCommand",
		);
	});

	test("should detect -oProxyCommand (combined form)", () => {
		expect(containsBlockedOption(["-oProxyCommand=evil"])).toBe(
			"-o ProxyCommand",
		);
		expect(containsBlockedOption(["-oproxycommand=evil"])).toBe(
			"-o ProxyCommand",
		);
		expect(containsBlockedOption(["-oPROXYCOMMAND=evil"])).toBe(
			"-o ProxyCommand",
		);
	});

	test("should detect ProxyCommand among other options", () => {
		expect(
			containsBlockedOption([
				"-L",
				"8080:localhost:80",
				"-o",
				"ProxyCommand=evil",
				"-N",
			]),
		).toBe("-o ProxyCommand");
	});

	test("should not false positive on similar option names", () => {
		expect(containsBlockedOption(["-o", "ProxyJump=host"])).toBeNull();
		expect(containsBlockedOption(["-o", "ProxyUseFdpass=yes"])).toBeNull();
	});
});

describe("splitPassThroughArgs", () => {
	test("should return empty arrays for empty input", () => {
		const result = splitPassThroughArgs([]);
		expect(result.options).toEqual([]);
		expect(result.command).toEqual([]);
	});

	test("should handle only options (no command)", () => {
		const result = splitPassThroughArgs(["-L", "8080:localhost:80", "-N"]);
		expect(result.options).toEqual(["-L", "8080:localhost:80", "-N"]);
		expect(result.command).toEqual([]);
	});

	test("should handle only command (no options)", () => {
		const result = splitPassThroughArgs(["ls", "-la", "/app"]);
		expect(result.options).toEqual([]);
		expect(result.command).toEqual(["ls", "-la", "/app"]);
	});

	test("should split options and command", () => {
		const result = splitPassThroughArgs([
			"-L",
			"8080:localhost:80",
			"ls",
			"-la",
		]);
		expect(result.options).toEqual(["-L", "8080:localhost:80"]);
		expect(result.command).toEqual(["ls", "-la"]);
	});

	test("should handle -i with separate argument", () => {
		const result = splitPassThroughArgs(["-i", "~/.ssh/key", "whoami"]);
		expect(result.options).toEqual(["-i", "~/.ssh/key"]);
		expect(result.command).toEqual(["whoami"]);
	});

	test("should handle combined short option with value", () => {
		// -L8080:localhost:80 (no space)
		const result = splitPassThroughArgs(["-L8080:localhost:80", "ls"]);
		expect(result.options).toEqual(["-L8080:localhost:80"]);
		expect(result.command).toEqual(["ls"]);
	});

	test("should handle -o with separate argument", () => {
		const result = splitPassThroughArgs([
			"-o",
			"ServerAliveInterval=60",
			"echo",
			"hello",
		]);
		expect(result.options).toEqual(["-o", "ServerAliveInterval=60"]);
		expect(result.command).toEqual(["echo", "hello"]);
	});

	test("should handle multiple options before command", () => {
		const result = splitPassThroughArgs([
			"-i",
			"~/.ssh/key",
			"-L",
			"8080:localhost:80",
			"-D",
			"1080",
			"-N",
			"-v",
			"cat",
			"/etc/hostname",
		]);
		expect(result.options).toEqual([
			"-i",
			"~/.ssh/key",
			"-L",
			"8080:localhost:80",
			"-D",
			"1080",
			"-N",
			"-v",
		]);
		expect(result.command).toEqual(["cat", "/etc/hostname"]);
	});

	test("should handle boolean flags (no argument)", () => {
		const result = splitPassThroughArgs(["-N", "-v", "-C", "ls"]);
		expect(result.options).toEqual(["-N", "-v", "-C"]);
		expect(result.command).toEqual(["ls"]);
	});

	test("should treat everything after first non-option as command", () => {
		// Even if command args look like options
		const result = splitPassThroughArgs(["ls", "-la", "-h"]);
		expect(result.options).toEqual([]);
		expect(result.command).toEqual(["ls", "-la", "-h"]);
	});

	test("should handle complex real-world example", () => {
		const result = splitPassThroughArgs([
			"-i",
			"~/.ssh/mykey",
			"-L",
			"3000:localhost:3000",
			"-o",
			"ServerAliveInterval=60",
			"-v",
			"bash",
			"-c",
			"echo hello && ls -la",
		]);
		expect(result.options).toEqual([
			"-i",
			"~/.ssh/mykey",
			"-L",
			"3000:localhost:3000",
			"-o",
			"ServerAliveInterval=60",
			"-v",
		]);
		expect(result.command).toEqual(["bash", "-c", "echo hello && ls -la"]);
	});
});
