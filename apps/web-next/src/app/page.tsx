'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const access = localStorage.getItem('bw_access')
    router.replace(access ? '/dashboard/home' : '/login')
  }, [router])

  return (
    <main className={styles.redirectShell}>
      <div className={styles.spinner} aria-label="Redirecting" />
    </main>
  )
}