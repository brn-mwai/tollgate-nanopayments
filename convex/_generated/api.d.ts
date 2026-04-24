/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _devpeek from "../_devpeek.js";
import type * as agents from "../agents.js";
import type * as bots from "../bots.js";
import type * as circle from "../circle.js";
import type * as crons from "../crons.js";
import type * as dev from "../dev.js";
import type * as events from "../events.js";
import type * as gemini from "../gemini.js";
import type * as hmac from "../hmac.js";
import type * as hourlyRollup from "../hourlyRollup.js";
import type * as http from "../http.js";
import type * as lib_apiKey from "../lib/apiKey.js";
import type * as lib_helpers from "../lib/helpers.js";
import type * as metrics from "../metrics.js";
import type * as nanopayments from "../nanopayments.js";
import type * as nonces from "../nonces.js";
import type * as pricingRules from "../pricingRules.js";
import type * as publishers from "../publishers.js";
import type * as quotes from "../quotes.js";
import type * as reputation from "../reputation.js";
import type * as sites from "../sites.js";
import type * as users from "../users.js";
import type * as wallets from "../wallets.js";
import type * as webhookAudit from "../webhookAudit.js";
import type * as withdrawals from "../withdrawals.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _devpeek: typeof _devpeek;
  agents: typeof agents;
  bots: typeof bots;
  circle: typeof circle;
  crons: typeof crons;
  dev: typeof dev;
  events: typeof events;
  gemini: typeof gemini;
  hmac: typeof hmac;
  hourlyRollup: typeof hourlyRollup;
  http: typeof http;
  "lib/apiKey": typeof lib_apiKey;
  "lib/helpers": typeof lib_helpers;
  metrics: typeof metrics;
  nanopayments: typeof nanopayments;
  nonces: typeof nonces;
  pricingRules: typeof pricingRules;
  publishers: typeof publishers;
  quotes: typeof quotes;
  reputation: typeof reputation;
  sites: typeof sites;
  users: typeof users;
  wallets: typeof wallets;
  webhookAudit: typeof webhookAudit;
  withdrawals: typeof withdrawals;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
