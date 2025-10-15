import "../globals.css";
import Sidebar from "@/components/sidebar/sidebar";

export const metadata = {
  title: "BudgetWise Dashboard",
  description: "Your personal budgeting assistant",
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-200 shadow-md flex-shrink-0">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
