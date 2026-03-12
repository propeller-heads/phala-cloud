import { safeGetOsImages } from "@phala/cloud";
import { defineCommand } from "@/src/core/define-command";
import type { CommandContext } from "@/src/core/types";
import { getClient } from "@/src/lib/client";
import { printTable } from "@/src/lib/table";
import { logger } from "@/src/utils/logger";
import {
	osImagesCommandMeta,
	osImagesCommandSchema,
	type OsImagesCommandInput,
} from "./command";

async function runOsImagesCommand(
	input: OsImagesCommandInput,
	context: CommandContext,
): Promise<number> {
	try {
		const client = await getClient();

		const isDev = input.dev ? true : input.prod ? false : undefined;

		const result = await safeGetOsImages(client, {
			page: 1,
			page_size: 100,
			is_dev: isDev,
		});

		if (!result.success) {
			context.fail(result.error.message);
			return 1;
		}

		const data = result.data;

		if (input.json) {
			context.success(data);
			return 0;
		}

		const columns = ["NAME", "VERSION", "OS_IMAGE_HASH", "DEV", "GPU"] as const;

		const rows = data.items.map((img) => ({
			NAME: img.name,
			VERSION: img.version,
			OS_IMAGE_HASH: img.os_image_hash ?? "-",
			DEV: img.is_dev ? "yes" : "no",
			GPU: img.requires_gpu ? "yes" : "no",
		}));

		if (rows.length === 0) {
			logger.info("No OS images found");
			return 0;
		}

		printTable(columns, rows);
		logger.info(`Total: ${data.total}`);
		return 0;
	} catch (error) {
		logger.logDetailedError(error);
		context.fail(
			`Failed to list OS images: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return 1;
	}
}

export const osImagesCommand = defineCommand({
	path: ["os-images"],
	meta: osImagesCommandMeta,
	schema: osImagesCommandSchema,
	handler: runOsImagesCommand,
});

export default osImagesCommand;
