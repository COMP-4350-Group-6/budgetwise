'use client'

import Link from 'next/link'
import styles from './signup.module.css'

export default function SignupPage() {
  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <div className={styles.logo}>BudgetWise</div>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Join BudgetWise to start tracking smarter</p>

        {/* Placeholder form — API integration later */}
        <form className={styles.form}>
          <label htmlFor="name">Full Name</label>
          <input id="name" type="text" placeholder="Jane Doe" />

          <label htmlFor="email">Email Address</label>
          <input id="email" type="email" placeholder="you@example.com" />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="••••••••" />

          <label className={styles.checkbox}>
            <input type="checkbox" /> <span>I agree to the Terms and Privacy Policy</span>
          </label>

          <button type="submit" className={styles.primaryBtn}>
            Create Account
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account?{' '}
          <Link href="/login" className={styles.link}>
            Log in
          </Link>
        </p>
      </section>
    </main>
  )
}