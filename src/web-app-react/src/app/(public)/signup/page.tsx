'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
export default function Signup(){
  const router = useRouter();
  function onSubmit(e: FormEvent){ e.preventDefault(); router.push('/dashboard/home'); }
  return (
    <main style={{display:'grid',placeItems:'center',height:'100vh',background:'#f2f3f7'}}>
      <div style={{background:'#fff',padding:24,borderRadius:12,width:380,boxShadow:'0 10px 24px rgba(0,0,0,.06)'}}>
        <h2 style={{marginTop:0}}>Create your account</h2>
        <form onSubmit={onSubmit}>
          <label>Name</label><input required style={{width:'100%',margin:'6px 0 12px'}} />
          <label>Email</label><input required type='email' style={{width:'100%',margin:'6px 0 12px'}} />
          <label>Password</label><input required type='password' style={{width:'100%',margin:'6px 0 16px'}} />
          <button type='submit' style={{width:'100%',padding:10,background:'#1f7a2e',color:'#fff',borderRadius:8}}>Create account</button>
        </form>
        <p style={{marginTop:12,fontSize:14}}>Already have an account? <Link href='/login'>Log in</Link></p>
      </div>
    </main>
  );
}
