import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>BudgetWise Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {currentUser?.email}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome to BudgetWise!</h2>
          <p>Your personal finance management dashboard is ready.</p>
          <p>This is where your budgeting features will be implemented.</p>
        </div>
        
        <div className="placeholder-cards">
          <div className="card">
            <h3>Budget Tracking</h3>
            <p>Set and monitor your budget limits</p>
          </div>
          
          <div className="card">
            <h3>Transaction Entry</h3>
            <p>Add and manage your transactions</p>
          </div>
          
          <div className="card">
            <h3>Spending Analysis</h3>
            <p>View your spending trends and insights</p>
          </div>
          
          <div className="card">
            <h3>CSV Upload</h3>
            <p>Import transactions from CSV files</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
