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
        <div className="logo">◆ App</div>

        <div className="group">
          <h5>Area</h5>
          <Link href="/dashboard/home">Section 1</Link>
        </div>

        <div className="group">
          <h5>Area</h5>
          <Link href="/dashboard/transactions">Section 2</Link>
          <Link href="/dashboard/budget">Section 3</Link>
          <Link href="/dashboard/insights">Section 4</Link>
        </div>

        <div className="bottom">
          <Link href="/login"><button className="logout">Exit</button></Link>
        </div>
      </aside>

      <nav className="navbar">
        <div className="tabs">
          <Tab href="/dashboard/home">View A</Tab>
          <Tab href="/dashboard/transactions">View B</Tab>
          <Tab href="/dashboard/budget">View C</Tab>
          <Tab href="/dashboard/insights">View D</Tab>
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