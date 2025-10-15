"use client";

import React from "react";

export default function TransactionsPage() {
  return (
    <div className="flex flex-col w-full h-full bg-gray-50 p-6 space-y-8 overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-700">Transaction Management</h1>

      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Add New Transaction</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter details for a recent expense or income.
        </p>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Description */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g., Coffee, Salary, Groceries"
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </div>

          {/* Amount */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Amount</label>
            <input
              type="number"
              placeholder="$ e.g., 5.50"
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Category</label>
            <select className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none">
              <option value="">Select a category</option>
              {/* Later dynamically populated */}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Date</label>
            <input
              type="date"
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </div>

          {/* Payment Type */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Payment Type</label>
            <select className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none">
              <option value="">Select payment type</option>
              <option value="cash">Cash</option>
              <option value="debit">Debit Card</option>
              <option value="credit">Credit Card</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          {/* Notes */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Notes (Optional)</label>
            <textarea
              placeholder="Any additional details..."
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              rows={1}
            />
          </div>
        </form>

        <div className="mt-6">
          <button
            type="submit"
            className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700"
          >
            Add Transaction
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>

          <div className="flex gap-3 items-center">
            {/* Search */}
            <input
              type="text"
              placeholder="Search transactions..."
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
            {/* Category Filter */}
            <select className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-green-400">
              <option>All Categories</option>
            </select>
            {/* Date Filter */}
            <button className="border border-gray-300 text-sm text-gray-600 px-3 py-1 rounded-md hover:bg-gray-100">
              Date Range
            </button>
          </div>
        </div>

        {/* Placeholder table */}
        <div className="text-center py-8 text-gray-500">
          No transactions available yet.
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recurring Payments & Subscriptions</h2>
          <button className="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700">
            + Add Recurring Payment
          </button>
        </div>

        {/* Placeholder table */}
        <div className="text-center py-8 text-gray-500">
          No recurring payments or subscriptions yet.
        </div>
      </section>
    </div>
  );
}