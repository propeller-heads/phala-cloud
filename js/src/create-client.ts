import { createClient as createBaseClient, Client as BaseClient } from "./client";
import type { ClientConfig } from "./types/client";
import type { z } from "zod";

import { getCurrentUser, safeGetCurrentUser, type CurrentUser } from "./actions/get_current_user";
import {
  getAvailableNodes,
  safeGetAvailableNodes,
  type AvailableNodes,
} from "./actions/get_available_nodes";
import {
  listInstanceTypes,
  safeListInstanceTypes,
  type PaginatedInstanceTypes,
  type ListInstanceTypesRequest,
} from "./actions/list-instance-types";
import {
  listWorkspaces,
  safeListWorkspaces,
  type ListWorkspacesRequest,
  type ListWorkspaces,
  type WorkspaceResponse,
} from "./actions/workspaces/list_workspaces";
import { getWorkspace, safeGetWorkspace } from "./actions/workspaces/get_workspace";
import {
  getCvmInfo,
  safeGetCvmInfo,
  type GetCvmInfoRequest,
  type GetCvmInfoResponse,
} from "./actions/cvms/get_cvm_info";
import {
  getCvmList,
  safeGetCvmList,
  type GetCvmListRequest,
  type GetCvmListResponse,
} from "./actions/cvms/get_cvm_list";
import {
  provisionCvm,
  safeProvisionCvm,
  type ProvisionCvmRequest,
  type ProvisionCvm,
} from "./actions/cvms/provision_cvm";
import {
  commitCvmProvision,
  safeCommitCvmProvision,
  type CommitCvmProvisionRequest,
  type CommitCvmProvision,
} from "./actions/cvms/commit_cvm_provision";
import {
  getCvmComposeFile,
  safeGetCvmComposeFile,
  type GetCvmComposeFileRequest,
  type GetCvmComposeFileResult,
} from "./actions/cvms/get_cvm_compose_file";
import {
  provisionCvmComposeFileUpdate,
  safeProvisionCvmComposeFileUpdate,
  type ProvisionCvmComposeFileUpdateRequest,
  type ProvisionCvmComposeFileUpdateResult,
} from "./actions/cvms/provision_cvm_compose_file_update";
import {
  commitCvmComposeFileUpdate,
  safeCommitCvmComposeFileUpdate,
  type CommitCvmComposeFileUpdateRequest,
  type CommitCvmComposeFileUpdate,
} from "./actions/cvms/commit_cvm_compose_file_update";
import { getKmsInfo, safeGetKmsInfo, type GetKmsInfoRequest } from "./actions/kms/get_kms_info";
import {
  getKmsList,
  safeGetKmsList,
  type GetKmsListRequest,
  type GetKmsListResponse,
} from "./actions/kms/get_kms_list";
import {
  getAppEnvEncryptPubKey,
  safeGetAppEnvEncryptPubKey,
  type GetAppEnvEncryptPubKeyRequest,
  type GetAppEnvEncryptPubKey as GetAppEnvEncryptPubKeyResult,
} from "./actions/kms/get_app_env_encrypt_pubkey";

import type { KmsInfo } from "./types/kms_info";

import type { SafeResult } from "./types/client";

/**
 * Create a full-featured Phala Cloud client with all actions
 *
 * This is the default client creation function with all methods built-in.
 * All actions are available as methods on the client instance.
 *
 * @example
 * ```typescript
 * import { createClient } from '@phala/cloud'
 *
 * const client = createClient({ apiKey: 'your-api-key' })
 *
 * // All actions available as methods
 * const user = await client.getCurrentUser()
 * const cvms = await client.getCvmList()
 * const result = await client.provisionCvm({...})
 * ```
 *
 * For tree-shaking optimization, use `createBaseClient` with individual action imports:
 * ```typescript
 * import { createBaseClient, getCurrentUser } from '@phala/cloud'
 *
 * const client = createBaseClient({ apiKey: 'your-api-key' })
 * const user = await getCurrentUser(client)
 * ```
 *
 * @param config - Client configuration
 * @returns Client extended with all available actions
 */
export function createClient(config: ClientConfig = {}): Client {
  const client = createBaseClient(config);

  // Type annotation ensures proper type inference for extend()
  const allActions: {
    readonly getCurrentUser: typeof getCurrentUser;
    readonly safeGetCurrentUser: typeof safeGetCurrentUser;
    readonly getAvailableNodes: typeof getAvailableNodes;
    readonly safeGetAvailableNodes: typeof safeGetAvailableNodes;
    readonly listInstanceTypes: typeof listInstanceTypes;
    readonly safeListInstanceTypes: typeof safeListInstanceTypes;
    readonly listWorkspaces: typeof listWorkspaces;
    readonly safeListWorkspaces: typeof safeListWorkspaces;
    readonly getWorkspace: typeof getWorkspace;
    readonly safeGetWorkspace: typeof safeGetWorkspace;
    readonly getCvmInfo: typeof getCvmInfo;
    readonly safeGetCvmInfo: typeof safeGetCvmInfo;
    readonly getCvmList: typeof getCvmList;
    readonly safeGetCvmList: typeof safeGetCvmList;
    readonly provisionCvm: typeof provisionCvm;
    readonly safeProvisionCvm: typeof safeProvisionCvm;
    readonly commitCvmProvision: typeof commitCvmProvision;
    readonly safeCommitCvmProvision: typeof safeCommitCvmProvision;
    readonly getCvmComposeFile: typeof getCvmComposeFile;
    readonly safeGetCvmComposeFile: typeof safeGetCvmComposeFile;
    readonly provisionCvmComposeFileUpdate: typeof provisionCvmComposeFileUpdate;
    readonly safeProvisionCvmComposeFileUpdate: typeof safeProvisionCvmComposeFileUpdate;
    readonly commitCvmComposeFileUpdate: typeof commitCvmComposeFileUpdate;
    readonly safeCommitCvmComposeFileUpdate: typeof safeCommitCvmComposeFileUpdate;
    readonly getKmsInfo: typeof getKmsInfo;
    readonly safeGetKmsInfo: typeof safeGetKmsInfo;
    readonly getKmsList: typeof getKmsList;
    readonly safeGetKmsList: typeof safeGetKmsList;
    readonly getAppEnvEncryptPubKey: typeof getAppEnvEncryptPubKey;
    readonly safeGetAppEnvEncryptPubKey: typeof safeGetAppEnvEncryptPubKey;
  } = {
    getCurrentUser,
    safeGetCurrentUser,
    getAvailableNodes,
    safeGetAvailableNodes,
    listInstanceTypes,
    safeListInstanceTypes,
    listWorkspaces,
    safeListWorkspaces,
    getWorkspace,
    safeGetWorkspace,
    getCvmInfo,
    safeGetCvmInfo,
    getCvmList,
    safeGetCvmList,
    provisionCvm,
    safeProvisionCvm,
    commitCvmProvision,
    safeCommitCvmProvision,
    getCvmComposeFile,
    safeGetCvmComposeFile,
    provisionCvmComposeFileUpdate,
    safeProvisionCvmComposeFileUpdate,
    commitCvmComposeFileUpdate,
    safeCommitCvmComposeFileUpdate,
    getKmsInfo,
    safeGetKmsInfo,
    getKmsList,
    safeGetKmsList,
    getAppEnvEncryptPubKey,
    safeGetAppEnvEncryptPubKey,
  };

  return client.extend(allActions) as Client;
}

/**
 * Extended client type with all action methods
 *
 * This type definition ensures proper type inference for all action methods,
 * including their overload signatures for schema parameters.
 */
export interface Client extends BaseClient {
  // Simple actions (no request parameters, optional schema parameter)
  getCurrentUser(): Promise<CurrentUser>;
  getCurrentUser<T extends z.ZodTypeAny>(parameters: { schema: T }): Promise<z.infer<T>>;
  getCurrentUser(parameters: { schema: false }): Promise<unknown>;

  safeGetCurrentUser(): Promise<SafeResult<CurrentUser>>;
  safeGetCurrentUser<T extends z.ZodTypeAny>(parameters: { schema: T }): Promise<
    SafeResult<z.infer<T>>
  >;
  safeGetCurrentUser(parameters: { schema: false }): Promise<SafeResult<unknown>>;

  getAvailableNodes(): Promise<AvailableNodes>;
  getAvailableNodes<T extends z.ZodTypeAny>(parameters: { schema: T }): Promise<z.infer<T>>;
  getAvailableNodes(parameters: { schema: false }): Promise<unknown>;

  safeGetAvailableNodes(): Promise<SafeResult<AvailableNodes>>;
  safeGetAvailableNodes<T extends z.ZodTypeAny>(parameters: { schema: T }): Promise<
    SafeResult<z.infer<T>>
  >;
  safeGetAvailableNodes(parameters: { schema: false }): Promise<SafeResult<unknown>>;

  // Actions with optional request parameters
  listInstanceTypes(request?: ListInstanceTypesRequest): Promise<PaginatedInstanceTypes>;
  listInstanceTypes<T extends z.ZodTypeAny>(
    request: ListInstanceTypesRequest | undefined,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  listInstanceTypes(
    request: ListInstanceTypesRequest | undefined,
    parameters: { schema: false },
  ): Promise<unknown>;

  safeListInstanceTypes(
    request?: ListInstanceTypesRequest,
  ): Promise<SafeResult<PaginatedInstanceTypes>>;
  safeListInstanceTypes<T extends z.ZodTypeAny>(
    request: ListInstanceTypesRequest | undefined,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeListInstanceTypes(
    request: ListInstanceTypesRequest | undefined,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  listWorkspaces(request?: ListWorkspacesRequest): Promise<ListWorkspaces>;
  listWorkspaces<T extends z.ZodTypeAny>(
    request: ListWorkspacesRequest | undefined,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  listWorkspaces(
    request: ListWorkspacesRequest | undefined,
    parameters: { schema: false },
  ): Promise<unknown>;

  safeListWorkspaces(request?: ListWorkspacesRequest): Promise<SafeResult<ListWorkspaces>>;
  safeListWorkspaces<T extends z.ZodTypeAny>(
    request: ListWorkspacesRequest | undefined,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeListWorkspaces(
    request: ListWorkspacesRequest | undefined,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  getCvmList(request?: GetCvmListRequest): Promise<GetCvmListResponse>;
  getCvmList<T extends z.ZodTypeAny>(
    request: GetCvmListRequest | undefined,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  getCvmList(
    request: GetCvmListRequest | undefined,
    parameters: { schema: false },
  ): Promise<unknown>;

  safeGetCvmList(request?: GetCvmListRequest): Promise<SafeResult<GetCvmListResponse>>;
  safeGetCvmList<T extends z.ZodTypeAny>(
    request: GetCvmListRequest | undefined,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeGetCvmList(
    request: GetCvmListRequest | undefined,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  getKmsList(request?: GetKmsListRequest): Promise<GetKmsListResponse>;
  getKmsList<T extends z.ZodTypeAny>(
    request: GetKmsListRequest | undefined,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  getKmsList(
    request: GetKmsListRequest | undefined,
    parameters: { schema: false },
  ): Promise<unknown>;

  safeGetKmsList(request?: GetKmsListRequest): Promise<SafeResult<GetKmsListResponse>>;
  safeGetKmsList<T extends z.ZodTypeAny>(
    request: GetKmsListRequest | undefined,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeGetKmsList(
    request: GetKmsListRequest | undefined,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  // Actions with required request parameters
  getWorkspace(teamSlug: string): Promise<WorkspaceResponse>;
  getWorkspace<T extends z.ZodTypeAny>(
    teamSlug: string,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  getWorkspace(teamSlug: string, parameters: { schema: false }): Promise<unknown>;

  safeGetWorkspace(teamSlug: string): Promise<SafeResult<WorkspaceResponse>>;
  safeGetWorkspace<T extends z.ZodTypeAny>(
    teamSlug: string,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeGetWorkspace(teamSlug: string, parameters: { schema: false }): Promise<SafeResult<unknown>>;

  getCvmInfo(request: GetCvmInfoRequest): Promise<GetCvmInfoResponse>;
  getCvmInfo<T extends z.ZodTypeAny>(
    request: GetCvmInfoRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  getCvmInfo(request: GetCvmInfoRequest, parameters: { schema: false }): Promise<unknown>;

  safeGetCvmInfo(request: GetCvmInfoRequest): Promise<SafeResult<GetCvmInfoResponse>>;
  safeGetCvmInfo<T extends z.ZodTypeAny>(
    request: GetCvmInfoRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeGetCvmInfo(
    request: GetCvmInfoRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  getCvmComposeFile(request: GetCvmComposeFileRequest): Promise<GetCvmComposeFileResult>;
  getCvmComposeFile<T extends z.ZodTypeAny>(
    request: GetCvmComposeFileRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  getCvmComposeFile(
    request: GetCvmComposeFileRequest,
    parameters: { schema: false },
  ): Promise<unknown>;

  safeGetCvmComposeFile(
    request: GetCvmComposeFileRequest,
  ): Promise<SafeResult<GetCvmComposeFileResult>>;
  safeGetCvmComposeFile<T extends z.ZodTypeAny>(
    request: GetCvmComposeFileRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeGetCvmComposeFile(
    request: GetCvmComposeFileRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  provisionCvm(request: ProvisionCvmRequest): Promise<ProvisionCvm>;
  provisionCvm<T extends z.ZodTypeAny>(
    request: ProvisionCvmRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  provisionCvm(request: ProvisionCvmRequest, parameters: { schema: false }): Promise<unknown>;

  safeProvisionCvm(request: ProvisionCvmRequest): Promise<SafeResult<ProvisionCvm>>;
  safeProvisionCvm<T extends z.ZodTypeAny>(
    request: ProvisionCvmRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeProvisionCvm(
    request: ProvisionCvmRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  commitCvmProvision(request: CommitCvmProvisionRequest): Promise<CommitCvmProvision>;
  commitCvmProvision<T extends z.ZodTypeAny>(
    request: CommitCvmProvisionRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  commitCvmProvision(
    request: CommitCvmProvisionRequest,
    parameters: { schema: false },
  ): Promise<unknown>;

  safeCommitCvmProvision(
    request: CommitCvmProvisionRequest,
  ): Promise<SafeResult<CommitCvmProvision>>;
  safeCommitCvmProvision<T extends z.ZodTypeAny>(
    request: CommitCvmProvisionRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeCommitCvmProvision(
    request: CommitCvmProvisionRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  provisionCvmComposeFileUpdate(
    request: ProvisionCvmComposeFileUpdateRequest,
  ): Promise<ProvisionCvmComposeFileUpdateResult>;
  provisionCvmComposeFileUpdate<T extends z.ZodTypeAny>(
    request: ProvisionCvmComposeFileUpdateRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  provisionCvmComposeFileUpdate(
    request: ProvisionCvmComposeFileUpdateRequest,
    parameters: { schema: false },
  ): Promise<unknown>;

  safeProvisionCvmComposeFileUpdate(
    request: ProvisionCvmComposeFileUpdateRequest,
  ): Promise<SafeResult<ProvisionCvmComposeFileUpdateResult>>;
  safeProvisionCvmComposeFileUpdate<T extends z.ZodTypeAny>(
    request: ProvisionCvmComposeFileUpdateRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeProvisionCvmComposeFileUpdate(
    request: ProvisionCvmComposeFileUpdateRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  commitCvmComposeFileUpdate(
    request: CommitCvmComposeFileUpdateRequest,
  ): Promise<CommitCvmComposeFileUpdate>;
  commitCvmComposeFileUpdate<T extends z.ZodTypeAny>(
    request: CommitCvmComposeFileUpdateRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  commitCvmComposeFileUpdate(
    request: CommitCvmComposeFileUpdateRequest,
    parameters: { schema: false },
  ): Promise<unknown>;

  safeCommitCvmComposeFileUpdate(
    request: CommitCvmComposeFileUpdateRequest,
  ): Promise<SafeResult<CommitCvmComposeFileUpdate>>;
  safeCommitCvmComposeFileUpdate<T extends z.ZodTypeAny>(
    request: CommitCvmComposeFileUpdateRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeCommitCvmComposeFileUpdate(
    request: CommitCvmComposeFileUpdateRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  getKmsInfo(request: GetKmsInfoRequest): Promise<KmsInfo>;
  getKmsInfo<T extends z.ZodTypeAny>(
    request: GetKmsInfoRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  getKmsInfo(request: GetKmsInfoRequest, parameters: { schema: false }): Promise<unknown>;

  safeGetKmsInfo(request: GetKmsInfoRequest): Promise<SafeResult<KmsInfo>>;
  safeGetKmsInfo<T extends z.ZodTypeAny>(
    request: GetKmsInfoRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeGetKmsInfo(
    request: GetKmsInfoRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  getAppEnvEncryptPubKey(
    request: GetAppEnvEncryptPubKeyRequest,
  ): Promise<GetAppEnvEncryptPubKeyResult>;
  getAppEnvEncryptPubKey<T extends z.ZodTypeAny>(
    request: GetAppEnvEncryptPubKeyRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  getAppEnvEncryptPubKey(
    request: GetAppEnvEncryptPubKeyRequest,
    parameters: { schema: false },
  ): Promise<unknown>;

  safeGetAppEnvEncryptPubKey(
    request: GetAppEnvEncryptPubKeyRequest,
  ): Promise<SafeResult<GetAppEnvEncryptPubKeyResult>>;
  safeGetAppEnvEncryptPubKey<T extends z.ZodTypeAny>(
    request: GetAppEnvEncryptPubKeyRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeGetAppEnvEncryptPubKey(
    request: GetAppEnvEncryptPubKeyRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;
}
