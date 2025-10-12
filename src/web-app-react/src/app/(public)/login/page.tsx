'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent } from 'react'

export default function Login() {
  const router = useRouter()
  function onSubmit(e: FormEvent) {
    e.preventDefault()
    router.push('/dashboard/home')
  }

  return (
    <main style={{display:'grid',placeItems:'center',height:'100vh',background:'#f3f4f6'}}>
      <div style={{background:'#fff',padding:24,borderRadius:12,width:420,boxShadow:'0 10px 24px rgba(0,0,0,.06)'}}>
        <h2 style={{marginTop:0, textAlign:'center', color:'#2e7d32'}}>BudgetWise</h2>
        <h3 style={{textAlign:'center', marginTop:4}}>Welcome Back</h3>
        <form onSubmit={onSubmit} style={{marginTop:16}}>
          <label>Email Address</label>
          <input placeholder="john.doe@example.com" />
          <label style={{marginTop:8}}>Password</label>
          <input type="password" placeholder="••••••••" />
          <div style={{display:'flex',justifyContent:'space-between',margin:'10px 0 14px',fontSize:12}}>
            <a href="#">Forgot password?</a>
          </div>
          <button className="button primary" style={{width:'100%'}}>Sign in</button>
        </form>
        <p style={{marginTop:12,fontSize:14,textAlign:'center'}}>
          Don’t have an account? <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </main>
  )
}