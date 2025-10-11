import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Login from './pages/Login/Login'
import Home from './pages/Home/Home'
import TransactionManagement from './pages/TransactionManagement/TransactionManagement'
import Budget from './pages/Budget/Budget'
import Insights from './pages/Insights/Insights'
import './styles.css'

const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  {
    path: '/app',
    element: <App />,
    children: [
      { path: 'home', element: <Home /> },
      { path: 'transactions', element: <TransactionManagement /> },
      { path: 'budget', element: <Budget /> },
      { path: 'insights', element: <Insights /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)