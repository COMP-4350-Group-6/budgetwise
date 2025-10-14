import type { ClockPort } from "@budget/ports";
export const makeSystemClock = (): ClockPort => ({ now: () => new Date() });
