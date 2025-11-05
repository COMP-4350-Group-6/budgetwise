import {
  Home,
  Car,
  Heart,
  UtensilsCrossed,
  ShoppingCart,
  Film,
  Plane,
  PhoneCall,
  ShoppingBag,
  Lightbulb,
  Wallet,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

/**
 * Category icons used throughout budgeting and transaction views.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  Housing: Home,
  Transportation: Car,
  Food: UtensilsCrossed,
  Groceries: ShoppingCart,
  Dining: UtensilsCrossed,
  Entertainment: Film,
  Travel: Plane,
  Healthcare: Heart,
  Subscriptions: PhoneCall,
  Utilities: Lightbulb,
  Shopping: ShoppingBag,
  Other: Wallet,
};

/**
 * Dashboard-level icons for summary metrics (used in StatCard).
 */
export const DASHBOARD_ICONS: Record<
  "budget" | "spent" | "remaining" | "health",
  LucideIcon
> = {
  budget: Wallet,
  spent: TrendingDown,
  remaining: TrendingUp,
  health: ShieldCheck,
};