import { createClient as createBaseClient, type Client } from "./client";
import type { ClientConfig } from "./types/client";

import { getCurrentUser, safeGetCurrentUser } from "./actions/get_current_user";
import { getAvailableNodes, safeGetAvailableNodes } from "./actions/get_available_nodes";
import { listInstanceTypes, safeListInstanceTypes } from "./actions/list-instance-types";
import { listWorkspaces, safeListWorkspaces } from "./actions/workspaces/list_workspaces";
import { getWorkspace, safeGetWorkspace } from "./actions/workspaces/get_workspace";
import { getCvmInfo, safeGetCvmInfo } from "./actions/cvms/get_cvm_info";
import { getCvmList, safeGetCvmList } from "./actions/cvms/get_cvm_list";
import { provisionCvm, safeProvisionCvm } from "./actions/cvms/provision_cvm";
import { commitCvmProvision, safeCommitCvmProvision } from "./actions/cvms/commit_cvm_provision";
import { getCvmComposeFile, safeGetCvmComposeFile } from "./actions/cvms/get_cvm_compose_file";
import {
  provisionCvmComposeFileUpdate,
  safeProvisionCvmComposeFileUpdate,
} from "./actions/cvms/provision_cvm_compose_file_update";
import {
  commitCvmComposeFileUpdate,
  safeCommitCvmComposeFileUpdate,
} from "./actions/cvms/commit_cvm_compose_file_update";
import { getKmsInfo, safeGetKmsInfo } from "./actions/kms/get_kms_info";
import { getKmsList, safeGetKmsList } from "./actions/kms/get_kms_list";
import {
  getAppEnvEncryptPubKey,
  safeGetAppEnvEncryptPubKey,
} from "./actions/kms/get_app_env_encrypt_pubkey";

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
export function createClient(config: ClientConfig = {}) {
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

  return client.extend(allActions);
}
