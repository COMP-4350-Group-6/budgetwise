import "./globals.css";
import Sidebar from "@/components/sidebar/sidebar";

export const metadata = {
  title: "BudgetWise",
  description: "Smarter Budgeting with AI Insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-50 text-brandDarkerGreen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
