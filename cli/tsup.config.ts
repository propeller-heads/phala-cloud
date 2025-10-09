import { defineConfig } from "tsup";

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
	},
});
