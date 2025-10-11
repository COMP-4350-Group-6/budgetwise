import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    navigate('/app/home')
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>BudgetWise</h2>
        <h3>Welcome Back</h3>
        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input type="email" placeholder="john.doe@example.com" required />
          
          <label>Password</label>
          <input type="password" placeholder="********" required />

          <button type="submit">Sign In</button>
        </form>
        <p className="signup-link">
          Don’t have an account? <a href="#">Sign Up</a>
        </p>
      </div>
    </div>
  )
}