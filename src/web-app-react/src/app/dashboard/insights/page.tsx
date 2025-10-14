"use client";

import React from "react";

export default function InsightsPage() {
  return (
    <div className="flex flex-col w-full h-full bg-gray-50 p-6 space-y-8 overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-700">Insights</h1>

      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Insights</h2>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            "Total Spending",
            "Savings Rate",
            "Upcoming Bills",
            "Net Worth Change",
          ].map((title, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between"
            >
              <div>
                <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
                <p className="text-2xl font-semibold text-gray-800">--</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">No data available yet</p>
            </div>
          ))}
        </div>

        <div className="border border-gray-200 rounded-lg p-4 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Spending by Category
            </h3>
            <select className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-green-400">
              <option>Last 30 Days</option>
            </select>
          </div>

          {/* Placeholder Chart */}
          <div className="flex justify-center items-center h-48 text-gray-400 border border-dashed border-gray-300 rounded-lg">
            (Bar Chart Coming Soon)
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Financial Trends</h3>
            <select className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-green-400">
              <option>Net Income</option>
            </select>
          </div>

          {/* Placeholder Chart */}
          <div className="flex justify-center items-center h-48 text-gray-400 border border-dashed border-gray-300 rounded-lg">
            (Line Chart Coming Soon)
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 mb-8 bg-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Emergency Fund Status</h3>
              <p className="text-2xl font-semibold text-gray-800">$ --</p>
              <p className="text-xs text-gray-500 mt-1">Goal: --</p>
            </div>
            <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">
              Needs Attention
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-3 rounded-full mb-4">
            <div className="bg-green-600 h-3 rounded-full w-[0%]" />
          </div>

          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Adjust Goal
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Alerts & Notifications
          </h3>

          <ul className="divide-y divide-gray-200">
            {/* Placeholder alerts */}
            <li className="py-3 text-sm text-gray-500">
              No notifications yet.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}