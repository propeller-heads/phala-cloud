import type { ZodTypeAny } from "zod";
import type {
	CommandDefinition,
	CommandHandler,
	CommandMeta,
	CommandPath,
} from "./types";

export interface DefineCommandParams<Schema extends ZodTypeAny> {
	readonly path: CommandPath;
	readonly meta: CommandMeta;
	readonly schema: Schema;
	readonly handler: CommandHandler<Schema>;
}

export function defineCommand<Schema extends ZodTypeAny>(
	params: DefineCommandParams<Schema>,
): CommandDefinition<Schema> {
	return {
		path: params.path,
		meta: params.meta,
		schema: params.schema,
		run: params.handler,
	};
}
