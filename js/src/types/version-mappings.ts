/**
 * Version-specific type mappings for API responses
 *
 * This file contains conditional types that map API versions to their
 * corresponding response types, enabling TypeScript to infer the correct
 * types based on the client's API version.
 */

import type { ApiVersion } from "./client";
import type { PaginatedCvmInfosV20251028, CvmDetailV20251028 } from "./cvm_info_v20251028";
import type { PaginatedCvmInfosV20260121, CvmInfoDetailV20260121 } from "./cvm_info_v20260121";

/**
 * Maps API version to the paginated CVM list response type
 */
export type GetCvmListResponseForVersion<V extends ApiVersion> = V extends "2026-01-21"
  ? PaginatedCvmInfosV20260121
  : V extends "2025-10-28"
    ? PaginatedCvmInfosV20251028
    : PaginatedCvmInfosV20260121;

/**
 * Maps API version to the CVM info detail response type
 */
export type GetCvmInfoResponseForVersion<V extends ApiVersion> = V extends "2026-01-21"
  ? CvmInfoDetailV20260121
  : V extends "2025-10-28"
    ? CvmDetailV20251028
    : CvmInfoDetailV20260121;
