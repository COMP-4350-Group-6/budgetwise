import type { IdPort } from "@budget/ports";
import { monotonicFactory } from "ulid";
const mono = monotonicFactory();
export const makeUlid = (): IdPort => ({ ulid: () => mono() });
