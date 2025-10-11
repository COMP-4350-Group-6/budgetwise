import { Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <div className="page">
          <Outlet />
        </div>
      </main>
    </div>
  )
}