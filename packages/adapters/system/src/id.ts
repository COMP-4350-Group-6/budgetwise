import { uuidv7 } from "uuidv7";
import type { IdPort } from "@budget/ports";

export const makeUuid = (): IdPort => ({ uuid: () => uuidv7() });
