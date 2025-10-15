"use client";

import React, { useState, useEffect } from "react";
import { budgetService, categoryService, type BudgetDashboard, type Category } from "../../../services/budgetService";

export default function BudgetPage() {
  const [dashboard, setDashboard] = useState<BudgetDashboard | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    amount: '',
    currency: 'CAD',
    period: 'MONTHLY' as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
    startDate: new Date().toISOString().split('T')[0],
    alertThreshold: '80',
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load categories first
      const cats = await categoryService.listCategories(true);
      setCategories(cats);
      
      // If no categories, seed defaults
      if (cats.length === 0) {
        const seeded = await categoryService.seedDefaultCategories();
        setCategories(seeded);
      }
      
      // Load dashboard
      const dash = await budgetService.getDashboard();
      setDashboard(dash);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load budget data';
      setError(errorMessage);
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (cents: number, currency = 'USD'): string => {
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getStatusColor = (percentageUsed: number, isOverBudget: boolean): string => {
    if (isOverBudget) return 'bg-red-600';
    if (percentageUsed >= 80) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const budgetData = {
        categoryId: formData.categoryId,
        name: formData.name,
        amountCents: Math.round(parseFloat(formData.amount) * 100),
        currency: formData.currency,
        period: formData.period,
        startDate: formData.startDate, // Send as ISO string
        alertThreshold: parseInt(formData.alertThreshold),
      };
      
      console.log('Creating budget with data:', budgetData);
      await budgetService.createBudget(budgetData as any);
      
      // Reset form and reload
      setShowCreateForm(false);
      setFormData({
        categoryId: '',
        name: '',
        amount: '',
        currency: 'CAD',
        period: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        alertThreshold: '80',
      });
      loadDashboard();
    } catch (err) {
      console.error('Budget creation error:', err);
      alert('Failed to create budget: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading budget data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full h-full bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={loadDashboard}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 p-6 space-y-8 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-700">Budget Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            + Create Budget
          </button>
          <button
            onClick={loadDashboard}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Create Budget Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Budget</h2>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Monthly Groceries"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="500.00"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Get alerted when spending reaches this % of budget</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overall Summary */}
      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Budget Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-1">Total Budget</h3>
            <p className="text-2xl font-semibold text-blue-700">
              {dashboard ? formatMoney(dashboard.totalBudgetCents) : '--'}
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-1">Total Spent</h3>
            <p className="text-2xl font-semibold text-gray-700">
              {dashboard ? formatMoney(dashboard.totalSpentCents) : '--'}
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-1">Remaining</h3>
            <p className="text-2xl font-semibold text-green-700">
              {dashboard ? formatMoney(dashboard.totalBudgetCents - dashboard.totalSpentCents) : '--'}
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-1">Alerts</h3>
            <p className="text-2xl font-semibold text-yellow-600">
              {dashboard?.alertCount || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {dashboard?.overBudgetCount || 0} over budget
            </p>
          </div>
        </div>
      </section>

      {/* Category Budgets */}
      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Category Budgets</h2>
        
        {dashboard && dashboard.categories.length > 0 ? (
          <div className="space-y-4">
            {dashboard.categories.map((category) => (
              <div
                key={category.categoryId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{category.categoryIcon || '📦'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">{category.categoryName}</h3>
                      <p className="text-sm text-gray-500">
                        {category.budgets.length} budget{category.budgets.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Spent / Budget</p>
                    <p className="font-semibold text-gray-800">
                      {formatMoney(category.totalSpentCents)} / {formatMoney(category.totalBudgetCents)}
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${getStatusColor(
                      category.overallPercentageUsed,
                      category.hasOverBudget
                    )}`}
                    style={{ width: `${Math.min(category.overallPercentageUsed, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-600">
                    {category.overallPercentageUsed.toFixed(1)}% used
                  </p>
                  {category.hasOverBudget && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      Over Budget
                    </span>
                  )}
                </div>
                
                {/* Individual Budgets */}
                {category.budgets.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    {category.budgets.map((budget) => (
                      <div key={budget.budget.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {budget.budget.name} ({budget.budget.period})
                        </span>
                        <span className={budget.isOverBudget ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                          {formatMoney(budget.spentCents)} / {formatMoney(budget.budget.amountCents)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No budgets created yet.</p>
            <p className="text-sm">Create your first budget to start tracking spending.</p>
          </div>
        )}
      </section>

      {/* Available Categories */}
      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Categories ({categories.length})
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow cursor-pointer"
              style={{ borderColor: cat.color || '#e5e7eb' }}
            >
              <div className="text-2xl mb-1">{cat.icon || '📦'}</div>
              <div className="text-xs font-medium text-gray-700 truncate">
                {cat.name}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}