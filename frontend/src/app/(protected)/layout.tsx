import "../globals.css";
import ProtectedLayoutClient from "./ProtectedLayoutClient";

export const metadata = {
  title: "BudgetWise Dashboard",
  description: "Your personal budgeting assistant",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}
