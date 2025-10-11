import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo"> BudgetWise</div>

      <div className="group">
        <h5>Overview</h5>
        <NavLink to="/app/home" className={({isActive})=>isActive?'active':''}>Home</NavLink>
      </div>

      <div className="group">
        <h5>Manage</h5>
        <NavLink to="/app/transactions" className={({isActive})=>isActive?'active':''}>
          Transaction Management
        </NavLink>
        <NavLink to="/app/budget" className={({isActive})=>isActive?'active':''}>
          Budget
        </NavLink>
        <NavLink to="/app/insights" className={({isActive})=>isActive?'active':''}>
          Insights
        </NavLink>
      </div>

      <div className="bottom">
        <button className="logout">Logout</button>
      </div>
    </aside>
  )
}