/**
 * Barrel export for all test mock utilities.
 * Import what you need:
 *
 * import { mockApiClient, mockFramerMotion, mockNextNavigation, TestQueryWrapper } from "@/test/mocks";
 */
export {
  mockApiClient,
  createSuccessResponse,
  createPaginatedResponse,
  createErrorResponse,
} from "./api-client";
export { mockNextNavigation } from "./next-navigation";
export { mockFramerMotion } from "./framer-motion";
export { createTestQueryClient, TestQueryWrapper } from "./tanstack-query";
