'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function Tab({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href
  return <Link href={href} className={active ? 'active' : ''}>{children}</Link>
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="logo"> BudgetWise</div>

        <div className="group">
          <Link href="/dashboard/home">Home</Link>
          <Link href="/dashboard/transactions">Transaction Management</Link>
          <Link href="/dashboard/budget">Budget</Link>
          <Link href="/dashboard/insights">Insights</Link>
        </div>

        <div className="bottom">
          <Link href="/login"><button className="logout">Logout</button></Link>
        </div>
      </aside>

      <nav className="navbar">
        <div className="tabs">
          <Tab href="/dashboard/home">Home</Tab>
          <Tab href="/dashboard/transactions">Transaction Management</Tab>
          <Tab href="/dashboard/budget">Budget</Tab>
          <Tab href="/dashboard/insights">Insights</Tab>
        </div>
        <div className="right">
          <button className="button">Action</button>
        </div>
      </nav>

      <main className="main-content">
        <div className="page">{children}</div>
      </main>
    </div>
  )
}