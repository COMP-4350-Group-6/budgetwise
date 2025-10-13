'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormEvent } from 'react'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // placeholder: pretend auth succeeded.. i would be updating soon 
    router.push('/dashboard/home')
  }

  return (
    <main className={styles.shell}>
      <section className={styles.card} aria-labelledby="login-title">
        <div className={styles.logo}>BudgetWise</div>
        <h1 id="login-title" className={styles.title}>Welcome Back</h1>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="john.doe@example.com"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <div className={styles.passwordRow}>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              aria-label="Show password"
              className={styles.eyeBtn}
              // no-op: just a visual placeholder
              onClick={() => {}}
            />
          </div>

          <div className={styles.linksRow}>
            <Link href="/forgot-password" className={styles.link}>
              Forgot password?
            </Link>
          </div>

          <label className={styles.checkbox}>
            <input type="checkbox" /> <span>I’m not a robot</span>
          </label>

          <button type="submit" className={styles.primaryBtn}>
            Sign in
          </button>
        </form>

        <p className={styles.footerText}>
          Don’t have an account?{' '}
          <Link href="/signup" className={styles.link}>
            Sign Up
          </Link>
        </p>
      </section>
    </main>
  )
}