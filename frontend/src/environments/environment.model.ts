/**
 * Shape of the environment configuration.
 *
 * This lives in its own file because `environment.ts` is swapped out by
 * `fileReplacements` at build time — a type declared inside a replaced file
 * would disappear along with it.
 */
export interface AppEnvironment {
  readonly production: boolean;
  /** Base URL of the Trimly backend, e.g. https://api.trimly.app */
  readonly apiBaseUrl: string;
}
