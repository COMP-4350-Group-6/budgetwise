"use client";

import React from "react";

export default function BudgetPage() {
  return (
    <div className="flex flex-col w-full h-full bg-gray-50 p-6 space-y-8 overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-700">Budget</h1>

      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Budget Overview</h2>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* --- Monthly Income --- */}
          <div className="col-span-1 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-1">Monthly Income</h3>
            <p className="text-2xl font-semibold text-green-700 mb-4">--</p>

            {/* Income sources (dynamically rendered later) */}
            <ul className="space-y-2 text-sm text-gray-600">
              <li>No income sources added yet</li>
            </ul>

            {/* Add income input */}
            <div className="mt-4 flex gap-2">
              <input
                type="number"
                placeholder="Amount"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
              <button className="bg-green-600 text-white text-sm px-3 py-2 rounded-md hover:bg-green-700">
                Add Income
              </button>
            </div>
          </div>

          {/* --- Budget Adherence --- */}
          <div className="col-span-2 bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm text-gray-700 mb-2">Budget Adherence</h3>
              <p className="text-2xl font-semibold text-green-800">--</p>
              <p className="text-sm text-gray-600 mt-1">
                Budget performance details will appear here.
              </p>
            </div>

            <div className="w-full bg-gray-200 h-3 rounded-full mt-4">
              <div className="bg-green-600 h-3 rounded-full w-[0%]" />
            </div>

            <button className="text-sm text-green-700 underline mt-4 text-left hover:text-green-800">
              View Insights →
            </button>
          </div>

          {/* --- Quick Actions --- */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm text-gray-700 font-semibold mb-2">
                New Spending Category
              </h4>
              <p className="text-xs text-gray-500 mb-3">
                Create a new expense category.
              </p>
              <button className="bg-green-600 text-white text-sm px-3 py-2 rounded-md hover:bg-green-700">
                Add Category
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm text-gray-700 font-semibold mb-2">
                Create New Savings Goal
              </h4>
              <p className="text-xs text-gray-500 mb-3">
                Plan for future goals or purchases.
              </p>
              <button className="border border-green-600 text-green-600 text-sm px-3 py-2 rounded-md hover:bg-green-50">
                Set Goal
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Category Spending Limits</h2>

        {/* Dynamic category cards will render here later */}
        <div className="text-center py-8 text-gray-500">
          No spending categories available yet.
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Savings Goals</h2>

        {/* Dynamic goal cards will render here later */}
        <div className="text-center py-8 text-gray-500">
          No savings goals have been created yet.
        </div>
      </section>
    </div>
  );
}