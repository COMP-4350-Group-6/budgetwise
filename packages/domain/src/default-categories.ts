export interface DefaultCategoryConfig {
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const DEFAULT_CATEGORIES: DefaultCategoryConfig[] = [
  { name: "Housing", icon: "🏠", color: "#FF6B6B", description: "Rent, mortgage, property" },
  { name: "Transportation", icon: "🚗", color: "#4ECDC4", description: "Car, gas, public transit" },
  { name: "Food", icon: "🍔", color: "#95E1D3", description: "General food expenses" },
  { name: "Groceries", icon: "🛒", color: "#45B7D1", description: "Grocery shopping" },
  { name: "Dining Out", icon: "🍽️", color: "#F38181", description: "Restaurants, takeout" },
  { name: "Entertainment", icon: "🎬", color: "#AA96DA", description: "Movies, games, hobbies" },
  { name: "Shopping", icon: "🛍️", color: "#FCBAD3", description: "Clothing, personal items" },
  { name: "Utilities", icon: "💡", color: "#FFA07A", description: "Electric, water, internet" },
  { name: "Healthcare", icon: "⚕️", color: "#98D8C8", description: "Medical, insurance" },
  { name: "Education", icon: "📚", color: "#6C5CE7", description: "Tuition, courses, books" },
  { name: "Travel", icon: "✈️", color: "#00B894", description: "Trips, vacations" },
  { name: "Subscriptions", icon: "📱", color: "#FDCB6E", description: "Netflix, Spotify, etc." },
  { name: "Investments", icon: "💰", color: "#00CEC9", description: "Stocks, savings" },
  { name: "Salary", icon: "💵", color: "#55EFC4", description: "Income, wages" },
  { name: "Savings", icon: "🐷", color: "#81ECEC", description: "Emergency fund, goals" },
  { name: "Miscellaneous", icon: "📦", color: "#A29BFE", description: "Other expenses" },
];