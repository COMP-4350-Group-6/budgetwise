"use client";

import React from "react";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full h-full bg-gray-50 p-6 space-y-8">
      <h1 className="text-3xl font-bold text-green-800">Home</h1>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---- Budget Overview ---- */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Budget Overview</h2>
          <p className="text-sm text-gray-500 mb-4">Your current financial status.</p>

          {/* Placeholder values – later fetched from backend */}
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Total Balance:</span>
              <span className="font-bold text-gray-800">--</span>
            </div>
            <div className="flex justify-between">
              <span>Budget Used:</span>
              <span className="font-bold text-red-500">--</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining:</span>
              <span className="font-bold text-green-600">--</span>
            </div>
          </div>

          {/* Progress bar placeholder */}
          <div className="w-full bg-gray-200 h-3 rounded-full my-4">
            <div className="bg-green-500 h-3 rounded-full w-[0%]" />
          </div>

          <div className="flex gap-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              View Transactions
            </button>
            <button className="border border-green-600 text-green-600 px-4 py-2 rounded-md hover:bg-green-50">
              Manage Budgets
            </button>
          </div>
        </div>

        {/* ---- Spending Categories ---- */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Spending Categories</h2>
          <p className="text-sm text-gray-500 mb-4">Distribution of your expenses.</p>

          {/* Placeholder chart container */}
          <div className="flex justify-center items-center h-40 text-gray-400 border border-dashed border-gray-300 rounded-lg">
            (Pie Chart Coming Soon)
          </div>

          {/* Placeholder tags */}
          <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-600">
            {/* categories will be dynamically mapped here */}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
          <button className="text-green-600 text-sm hover:underline">View All →</button>
        </div>

        {/* Empty state (until transactions fetched) */}
        <div className="text-center py-8 text-gray-500">
          No recent transactions available yet.
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Quick Actions</h2>
        <p className="text-sm text-gray-500 mb-4">Perform common tasks easily.</p>

        <div className="flex flex-wrap gap-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            + Add New Transaction
          </button>
          <button className="border border-green-600 text-green-600 px-4 py-2 rounded-md hover:bg-green-50">
            Set New Savings Goal
          </button>
        </div>
      </section>
    </div>
  );
}