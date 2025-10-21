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
import { startCvm, safeStartCvm, type StartCvmRequest } from "./actions/cvms/start_cvm";
import { stopCvm, safeStopCvm, type StopCvmRequest } from "./actions/cvms/stop_cvm";
import { shutdownCvm, safeShutdownCvm, type ShutdownCvmRequest } from "./actions/cvms/shutdown_cvm";
import { restartCvm, safeRestartCvm, type RestartCvmRequest } from "./actions/cvms/restart_cvm";
import { deleteCvm, safeDeleteCvm, type DeleteCvmRequest } from "./actions/cvms/delete_cvm";
import {
  getCvmStats,
  safeGetCvmStats,
  type GetCvmStatsRequest,
  type CvmSystemInfo,
} from "./actions/cvms/get_cvm_stats";
import {
  getCvmNetwork,
  safeGetCvmNetwork,
  type GetCvmNetworkRequest,
  type CvmNetwork,
} from "./actions/cvms/get_cvm_network";
import {
  getCvmDockerCompose,
  safeGetCvmDockerCompose,
  type GetCvmDockerComposeRequest,
} from "./actions/cvms/get_cvm_docker_compose";
import {
  getCvmContainersStats,
  safeGetCvmContainersStats,
  type GetCvmContainersStatsRequest,
  type CvmContainersStats,
} from "./actions/cvms/get_cvm_containers_stats";
import {
  getCvmAttestation,
  safeGetCvmAttestation,
  type GetCvmAttestationRequest,
  type CvmAttestation,
} from "./actions/cvms/get_cvm_attestation";
import {
  updateCvmResources,
  safeUpdateCvmResources,
  type UpdateCvmResourcesRequest,
} from "./actions/cvms/update_cvm_resources";
import {
  updateCvmVisibility,
  safeUpdateCvmVisibility,
  type UpdateCvmVisibilityRequest,
} from "./actions/cvms/update_cvm_visibility";

import type { KmsInfo } from "./types/kms_info";
import type { VM } from "./types/cvm_info";

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
    readonly startCvm: typeof startCvm;
    readonly safeStartCvm: typeof safeStartCvm;
    readonly stopCvm: typeof stopCvm;
    readonly safeStopCvm: typeof safeStopCvm;
    readonly shutdownCvm: typeof shutdownCvm;
    readonly safeShutdownCvm: typeof safeShutdownCvm;
    readonly restartCvm: typeof restartCvm;
    readonly safeRestartCvm: typeof safeRestartCvm;
    readonly deleteCvm: typeof deleteCvm;
    readonly safeDeleteCvm: typeof safeDeleteCvm;
    readonly getCvmStats: typeof getCvmStats;
    readonly safeGetCvmStats: typeof safeGetCvmStats;
    readonly getCvmNetwork: typeof getCvmNetwork;
    readonly safeGetCvmNetwork: typeof safeGetCvmNetwork;
    readonly getCvmDockerCompose: typeof getCvmDockerCompose;
    readonly safeGetCvmDockerCompose: typeof safeGetCvmDockerCompose;
    readonly getCvmContainersStats: typeof getCvmContainersStats;
    readonly safeGetCvmContainersStats: typeof safeGetCvmContainersStats;
    readonly getCvmAttestation: typeof getCvmAttestation;
    readonly safeGetCvmAttestation: typeof safeGetCvmAttestation;
    readonly updateCvmResources: typeof updateCvmResources;
    readonly safeUpdateCvmResources: typeof safeUpdateCvmResources;
    readonly updateCvmVisibility: typeof updateCvmVisibility;
    readonly safeUpdateCvmVisibility: typeof safeUpdateCvmVisibility;
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
    startCvm,
    safeStartCvm,
    stopCvm,
    safeStopCvm,
    shutdownCvm,
    safeShutdownCvm,
    restartCvm,
    safeRestartCvm,
    deleteCvm,
    safeDeleteCvm,
    getCvmStats,
    safeGetCvmStats,
    getCvmNetwork,
    safeGetCvmNetwork,
    getCvmDockerCompose,
    safeGetCvmDockerCompose,
    getCvmContainersStats,
    safeGetCvmContainersStats,
    getCvmAttestation,
    safeGetCvmAttestation,
    updateCvmResources,
    safeUpdateCvmResources,
    updateCvmVisibility,
    safeUpdateCvmVisibility,
    getKmsInfo,
    safeGetKmsInfo,
    getKmsList,
    safeGetKmsList,
    getAppEnvEncryptPubKey,
    safeGetAppEnvEncryptPubKey,
  };

  return client.extend(allActions) as unknown as Client;
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

  // CVM Lifecycle Operations
  startCvm(request: StartCvmRequest): Promise<VM>;
  startCvm<T extends z.ZodTypeAny>(
    request: StartCvmRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  startCvm(request: StartCvmRequest, parameters: { schema: false }): Promise<unknown>;

  safeStartCvm(request: StartCvmRequest): Promise<SafeResult<VM>>;
  safeStartCvm<T extends z.ZodTypeAny>(
    request: StartCvmRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeStartCvm(
    request: StartCvmRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  stopCvm(request: StopCvmRequest): Promise<VM>;
  stopCvm<T extends z.ZodTypeAny>(
    request: StopCvmRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  stopCvm(request: StopCvmRequest, parameters: { schema: false }): Promise<unknown>;

  safeStopCvm(request: StopCvmRequest): Promise<SafeResult<VM>>;
  safeStopCvm<T extends z.ZodTypeAny>(
    request: StopCvmRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeStopCvm(request: StopCvmRequest, parameters: { schema: false }): Promise<SafeResult<unknown>>;

  shutdownCvm(request: ShutdownCvmRequest): Promise<VM>;
  shutdownCvm<T extends z.ZodTypeAny>(
    request: ShutdownCvmRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  shutdownCvm(request: ShutdownCvmRequest, parameters: { schema: false }): Promise<unknown>;

  safeShutdownCvm(request: ShutdownCvmRequest): Promise<SafeResult<VM>>;
  safeShutdownCvm<T extends z.ZodTypeAny>(
    request: ShutdownCvmRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeShutdownCvm(
    request: ShutdownCvmRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  restartCvm(request: RestartCvmRequest): Promise<VM>;
  restartCvm<T extends z.ZodTypeAny>(
    request: RestartCvmRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  restartCvm(request: RestartCvmRequest, parameters: { schema: false }): Promise<unknown>;

  safeRestartCvm(request: RestartCvmRequest): Promise<SafeResult<VM>>;
  safeRestartCvm<T extends z.ZodTypeAny>(
    request: RestartCvmRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeRestartCvm(
    request: RestartCvmRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  deleteCvm(request: DeleteCvmRequest): Promise<void>;
  deleteCvm<T extends z.ZodTypeAny>(
    request: DeleteCvmRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  deleteCvm(request: DeleteCvmRequest, parameters: { schema: false }): Promise<unknown>;

  safeDeleteCvm(request: DeleteCvmRequest): Promise<SafeResult<void>>;
  safeDeleteCvm<T extends z.ZodTypeAny>(
    request: DeleteCvmRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeDeleteCvm(
    request: DeleteCvmRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  // CVM Info/Stats Operations
  getCvmStats(request: GetCvmStatsRequest): Promise<CvmSystemInfo>;
  getCvmStats<T extends z.ZodTypeAny>(
    request: GetCvmStatsRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  getCvmStats(request: GetCvmStatsRequest, parameters: { schema: false }): Promise<unknown>;

  safeGetCvmStats(request: GetCvmStatsRequest): Promise<SafeResult<CvmSystemInfo>>;
  safeGetCvmStats<T extends z.ZodTypeAny>(
    request: GetCvmStatsRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeGetCvmStats(
    request: GetCvmStatsRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  getCvmNetwork(request: GetCvmNetworkRequest): Promise<CvmNetwork>;
  getCvmNetwork<T extends z.ZodTypeAny>(
    request: GetCvmNetworkRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  getCvmNetwork(request: GetCvmNetworkRequest, parameters: { schema: false }): Promise<unknown>;

  safeGetCvmNetwork(request: GetCvmNetworkRequest): Promise<SafeResult<CvmNetwork>>;
  safeGetCvmNetwork<T extends z.ZodTypeAny>(
    request: GetCvmNetworkRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeGetCvmNetwork(
    request: GetCvmNetworkRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  getCvmDockerCompose(request: GetCvmDockerComposeRequest): Promise<string>;
  getCvmDockerCompose<T extends z.ZodTypeAny>(
    request: GetCvmDockerComposeRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  getCvmDockerCompose(
    request: GetCvmDockerComposeRequest,
    parameters: { schema: false },
  ): Promise<unknown>;

  safeGetCvmDockerCompose(request: GetCvmDockerComposeRequest): Promise<SafeResult<string>>;
  safeGetCvmDockerCompose<T extends z.ZodTypeAny>(
    request: GetCvmDockerComposeRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeGetCvmDockerCompose(
    request: GetCvmDockerComposeRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  getCvmContainersStats(request: GetCvmContainersStatsRequest): Promise<CvmContainersStats>;
  getCvmContainersStats<T extends z.ZodTypeAny>(
    request: GetCvmContainersStatsRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  getCvmContainersStats(
    request: GetCvmContainersStatsRequest,
    parameters: { schema: false },
  ): Promise<unknown>;

  safeGetCvmContainersStats(
    request: GetCvmContainersStatsRequest,
  ): Promise<SafeResult<CvmContainersStats>>;
  safeGetCvmContainersStats<T extends z.ZodTypeAny>(
    request: GetCvmContainersStatsRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeGetCvmContainersStats(
    request: GetCvmContainersStatsRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  getCvmAttestation(request: GetCvmAttestationRequest): Promise<CvmAttestation>;
  getCvmAttestation<T extends z.ZodTypeAny>(
    request: GetCvmAttestationRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  getCvmAttestation(
    request: GetCvmAttestationRequest,
    parameters: { schema: false },
  ): Promise<unknown>;

  safeGetCvmAttestation(request: GetCvmAttestationRequest): Promise<SafeResult<CvmAttestation>>;
  safeGetCvmAttestation<T extends z.ZodTypeAny>(
    request: GetCvmAttestationRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeGetCvmAttestation(
    request: GetCvmAttestationRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  // CVM Update Operations
  updateCvmResources(request: UpdateCvmResourcesRequest): Promise<void>;
  updateCvmResources<T extends z.ZodTypeAny>(
    request: UpdateCvmResourcesRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  updateCvmResources(
    request: UpdateCvmResourcesRequest,
    parameters: { schema: false },
  ): Promise<unknown>;

  safeUpdateCvmResources(request: UpdateCvmResourcesRequest): Promise<SafeResult<void>>;
  safeUpdateCvmResources<T extends z.ZodTypeAny>(
    request: UpdateCvmResourcesRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeUpdateCvmResources(
    request: UpdateCvmResourcesRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;

  updateCvmVisibility(request: UpdateCvmVisibilityRequest): Promise<void>;
  updateCvmVisibility<T extends z.ZodTypeAny>(
    request: UpdateCvmVisibilityRequest,
    parameters: { schema: T },
  ): Promise<z.infer<T>>;
  updateCvmVisibility(
    request: UpdateCvmVisibilityRequest,
    parameters: { schema: false },
  ): Promise<unknown>;

  safeUpdateCvmVisibility(request: UpdateCvmVisibilityRequest): Promise<SafeResult<void>>;
  safeUpdateCvmVisibility<T extends z.ZodTypeAny>(
    request: UpdateCvmVisibilityRequest,
    parameters: { schema: T },
  ): Promise<SafeResult<z.infer<T>>>;
  safeUpdateCvmVisibility(
    request: UpdateCvmVisibilityRequest,
    parameters: { schema: false },
  ): Promise<SafeResult<unknown>>;
}
