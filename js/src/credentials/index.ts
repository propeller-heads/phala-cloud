// v20260121 (latest)
export {
  CurrentUserV20260121Schema,
  type CurrentUserV20260121,
  UserInfoSchema,
  type UserInfo,
  WorkspaceInfoSchema,
  type WorkspaceInfo,
  CreditsInfoSchema,
  type CreditsInfo,
} from "./current_user_v20260121";

// v20251028 (legacy)
export {
  CurrentUserV20251028Schema,
  type CurrentUserV20251028,
} from "./current_user_v20251028";

// Backward compatibility aliases
export {
  CurrentUserV20251028Schema as CurrentUserSchema,
  type CurrentUserV20251028 as CurrentUser,
} from "./current_user_v20251028";

export {
  CurrentUserV20260121Schema as AuthResponseSchema,
  type CurrentUserV20260121 as AuthResponse,
} from "./current_user_v20260121";
