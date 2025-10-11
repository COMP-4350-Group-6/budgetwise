import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="tabs">
        <NavLink to="/app/home" className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
        <NavLink to="/app/transactions" className={({isActive}) => isActive ? 'active' : ''}>Transaction Management</NavLink>
        <NavLink to="/app/budget" className={({isActive}) => isActive ? 'active' : ''}>Budget</NavLink>
        <NavLink to="/app/insights" className={({isActive}) => isActive ? 'active' : ''}>Insights</NavLink>
      </div>
      <div className="right">
        <button className="button">Log out</button>
      </div>
    </nav>
  )
}