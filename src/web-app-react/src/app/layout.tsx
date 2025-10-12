import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BudgetWise',
  description: 'BudgetWise Next.js Web App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}