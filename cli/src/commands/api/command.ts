import { z } from "zod";
import { commonAuthOptions } from "@/src/core/common-flags";
import type { CommandMeta } from "@/src/core/types";

const HTTP_METHODS = [
	"GET",
	"POST",
	"PUT",
	"PATCH",
	"DELETE",
	"HEAD",
	"OPTIONS",
] as const;

export const apiCommandMeta: CommandMeta = {
	name: "api",
	description: `Make an authenticated HTTP request to Phala Cloud API.

The endpoint should be an API path like "/cvms" or "/users/me".

By default, GET is used. If you add -f or -F parameters, it switches to POST.
Use -X to override the method explicitly.

Use -f key=value for string parameters, -F key:=value for typed JSON values
(numbers, booleans, null, arrays, objects).

Use --input to send a JSON file as request body, or --input - to read from stdin.

Use -q to filter JSON output with jq syntax (built-in, no jq installation needed).

ENVIRONMENT VARIABLES

  PHALA_CLOUD_API_KEY       Override the API key (useful for CI/CD)
  PHALA_CLOUD_API_PREFIX    Override the API base URL`,
	stability: "stable",
	arguments: [
		{
			name: "endpoint",
			description: "API endpoint path",
			required: true,
		},
	],
	options: [
		...commonAuthOptions,
		{
			name: "method",
			shorthand: "X",
			description: "HTTP method (default: GET)",
			type: "string",
			target: "method",
		},
		{
			name: "field",
			shorthand: "f",
			description: "String parameter: key=value",
			type: "string[]",
			target: "field",
		},
		{
			name: "raw-field",
			shorthand: "F",
			description: "Typed JSON parameter: key:=value",
			type: "string[]",
			target: "rawField",
		},
		{
			name: "header",
			shorthand: "H",
			description: "HTTP header: key:value",
			type: "string[]",
			target: "header",
		},
		{
			name: "input",
			description: 'Read body from file (use "-" for stdin)',
			type: "string",
			target: "input",
		},
		{
			name: "include",
			shorthand: "i",
			description: "Print response headers",
			type: "boolean",
			target: "include",
		},
		{
			name: "jq",
			shorthand: "q",
			description: "Filter output with jq expression",
			type: "string",
			target: "jq",
		},
		{
			name: "silent",
			description: "Don't print response body",
			type: "boolean",
			target: "silent",
		},
	],
	examples: [
		{
			name: "List CVMs",
			value: "phala api /cvms",
		},
		{
			name: "Get CVM by app ID",
			value: "phala api /cvms/app_xxx",
		},
		{
			name: "Filter with jq",
			value: "phala api /cvms -q '.items[].name'",
		},
		{
			name: "POST with string params",
			value: "phala api /endpoint -X POST -f name=foo -f tag=bar",
		},
		{
			name: "POST with typed params",
			value: "phala api /endpoint -X POST -F count:=10 -F enabled:=true",
		},
		{
			name: "POST from file",
			value: "phala api /endpoint -X POST --input data.json",
		},
		{
			name: "Show response headers",
			value: "phala api /cvms -i",
		},
	],
};

export const apiCommandSchema = z.object({
	endpoint: z.string(),
	method: z
		.enum(HTTP_METHODS)
		.default("GET")
		.transform((v) => v.toUpperCase() as (typeof HTTP_METHODS)[number]),
	field: z.array(z.string()).optional(),
	rawField: z.array(z.string()).optional(),
	header: z.array(z.string()).optional(),
	input: z.string().optional(),
	include: z.boolean().default(false),
	jq: z.string().optional(),
	silent: z.boolean().default(false),
	apiToken: z.string().optional(),
});

export type ApiCommandInput = z.infer<typeof apiCommandSchema>;
