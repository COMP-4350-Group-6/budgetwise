'use client'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'

export default function Login() {
  const router = useRouter()
  function onSubmit(e: FormEvent) {
    e.preventDefault()
    router.push('/dashboard/home')
  }

  return (
    <main className="center-screen">
      <div className="card auth-card">
        <h2 className="section-title text-center">App</h2>

        <form onSubmit={onSubmit} className="form grid-gap-sm mt-16">
          <label>Field A</label>
          <input placeholder="example@domain.com" />
          <label>Field B</label>
          <input type="password" placeholder="••••••••" />
          <button className="button primary" type="submit">
            Continue
          </button>
        </form>

        <p className="text-sm text-center mt-12">
          New? <a href="/signup">Create</a>
        </p>
      </div>
    </main>
  )
}