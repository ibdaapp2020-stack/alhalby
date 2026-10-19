/**
 * Data provider — the backend-agnostic data layer for the Store template.
 *
 * Consumers should import {@link isMockMode}, {@link isFirebaseMode}, or
 * {@link DATA_PROVIDER_MODE} from here (never read the env var directly).
 * Services call into {@link mockProducts}, {@link mockCategories}, etc.
 * when the resolved mode is `mock`.
 */
export {
  DATA_PROVIDER_MODE,
  isMockMode,
  isFirebaseMode,
  getDataProviderMode,
  hasFirebaseEnvConfigured,
  type DataProviderMode,
} from "./mode";

export * from "./mock";
