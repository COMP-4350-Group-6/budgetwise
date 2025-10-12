'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import styles from './page.module.css'

export default function Signup() {
  const router = useRouter()

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    router.push('/dashboard/home')
  }

  return (
    <main className={styles.shell}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create your account</h2>

        <form onSubmit={onSubmit} className={styles.form}>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required />

          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />

          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />

          <button type="submit" className={styles.primaryBtn}>
            Create account
          </button>
        </form>

        <p className={styles.meta}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </main>
  )
}