// src/modules/module_5/moderation/exports.ts

export { verifyContent } from "./services/content-filter-service";
export { verifyModeratorPermission } from "./services/role-verification-service";

export type { VerificationResult } from "./services/content-filter-service";
export type { AuthorizationResult } from "./services/role-verification-service";