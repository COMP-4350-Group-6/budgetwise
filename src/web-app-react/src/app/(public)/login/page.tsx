'use client'

import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import styles from './page.module.css'

export default function Login() {
  const router = useRouter()

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    router.push('/dashboard/home')
  }

  return (
    <main className={styles.shell}>
      <div className={styles.card}>
        <h2 className={styles.title}>Welcome Back</h2>

        <form onSubmit={onSubmit} className={styles.form}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="example@domain.com" required />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="••••••••" required />

          <button className={styles.primaryBtn} type="submit">
            Continue
          </button>
        </form>

        <p className={styles.meta}>
          New here? <a href="/signup">Create account</a>
        </p>
      </div>
    </main>
  )
}