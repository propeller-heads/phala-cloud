import { execSync } from "node:child_process";
import { defineConfig } from "tsup";

function getGitInfo(): string {
	try {
		const hash = execSync("git rev-parse --short HEAD", {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();

		// In CI, workspace dependency resolution modifies package.json after commit,
		// making the repo appear "dirty" even though it's a clean release build
		if (process.env.CI) {
			return `+${hash}`;
		}

		const dirty = execSync("git status --porcelain", {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
		return dirty ? `+${hash}-dirty` : `+${hash}`;
	} catch {
		return "";
	}
}

export default defineConfig({
	clean: true,
	dts: true,
	entry: ["src/index.ts", "src/api/index.ts"],
	format: ["esm"],
	sourcemap: true,
	minify: true,
	target: "esnext",
	outDir: "dist",
	platform: "node",
	bundle: true,
	splitting: false,
	noExternal: ["@phala/cloud"],
	esbuildOptions(options) {
		options.banner = {
			js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
		};
		options.define = {
			...options.define,
			__GIT_INFO__: JSON.stringify(getGitInfo()),
		};
	},
});
