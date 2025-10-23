"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";
import { budgetService } from "@/services/budgetService";
import type { BudgetDashboard } from "@/services/budgetService";
import { apiFetch } from "@/lib/apiClient";
import type { TransactionDTO } from "@/services/transactionsService";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  isPositive?: boolean;
}

interface CategoryChartData {
  name: string;
  value: number;
  color: string;
  icon?: string;
  percentage: number;
}

interface TrendDataPoint {
  date: string;
  amount: number;
  formattedDate: string;
}

interface WeeklyDataPoint {
  day: string;
  amount: number;
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  hasTransactions: boolean;
  transactionCount: number;
  totalAmount: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, isPositive }) => (
  <div className={styles.statCard}>
    <div className={styles.statIconWrapper}>{icon}</div>
    <div className={styles.statInfo}>
      <p className={styles.statLabel}>{title}</p>
      <div className={styles.statBottom}>
        <h3 className={styles.statValue}>{value}</h3>
        {change && (
          <span className={`${styles.statChange} ${isPositive ? styles.positive : styles.negative}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  </div>
);

const CalendarCard: React.FC<{ transactions: TransactionDTO[] }> = ({ transactions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // Filter transactions for current displayed month only
    const monthStart = new Date(year, month, 1).getTime();
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59).getTime();
    const monthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.occurredAt).getTime();
      return txDate >= monthStart && txDate <= monthEnd;
    });
    
    const days: CalendarDay[] = [];
    
    // Previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date,
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        hasTransactions: false,
        transactionCount: 0,
        totalAmount: 0,
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayTx = monthTransactions.filter(tx =>
        new Date(tx.occurredAt).toISOString().split('T')[0] === dateStr
      );
      const totalAmount = dayTx.reduce((sum, tx) => sum + Math.abs(tx.amountCents), 0);
      
      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        hasTransactions: dayTx.length > 0,
        transactionCount: dayTx.length,
        totalAmount,
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: false,
        hasTransactions: false,
        transactionCount: 0,
        totalAmount: 0,
      });
    }
    
    return days;
  }, [currentDate, transactions]);

  const selectedDateTransactions = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return transactions.filter(tx =>
      new Date(tx.occurredAt).toISOString().split('T')[0] === dateStr
    );
  }, [selectedDate, transactions]);

  return (
    <div className={styles.calendarCard}>
      <div className={styles.calendarHeader}>
        <div className={styles.monthSelector}>
          <button
            className={styles.monthBtn}
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          >
            ←
          </button>
          <span className={styles.monthName}>{monthNames[currentDate.getMonth()]}</span>
          <span className={styles.yearName}>{currentDate.getFullYear()}</span>
          <button
            className={styles.monthBtn}
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          >
            →
          </button>
        </div>
      </div>
      
      <div className={styles.calendarGrid}>
        <div className={styles.weekDays}>
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, i) => (
            <div key={i} className={styles.weekDay}>{day}</div>
          ))}
        </div>
        
        <div className={styles.daysGrid}>
          {calendarDays.map((day, i) => (
            <button
              key={i}
              className={`${styles.calendarDay} ${!day.isCurrentMonth ? styles.otherMonth : ''} ${selectedDate?.toDateString() === day.date.toDateString() ? styles.selected : ''}`}
              onClick={() => setSelectedDate(day.date)}
            >
              <span className={styles.dayNumber}>{day.dayNumber}</span>
              {day.hasTransactions && (
                <span className={styles.activityDot} />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {selectedDate && selectedDateTransactions.length > 0 && (
        <div className={styles.transactionPreview}>
          <h4 className={styles.previewTitle}>
            {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </h4>
          {selectedDateTransactions.map((tx, i) => (
            <div key={i} className={styles.txPreviewItem}>
              <span>{tx.note || 'Transaction'}</span>
              <span className={styles.txAmount}>${(Math.abs(tx.amountCents) / 100).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function HomePage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<BudgetDashboard | null>(null);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardData, txResponse] = await Promise.all([
          budgetService.getDashboard(),
          apiFetch<{ transactions: TransactionDTO[] }>('/transactions?days=90', {}, true)
        ]);
        setDashboard(dashboardData);
        setTransactions(txResponse.transactions || []);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalBudget = dashboard?.totalBudgetCents ?? 0;
    const totalSpent = dashboard?.totalSpentCents ?? 0;
    const totalRemaining = totalBudget - totalSpent;
    const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      percentageUsed,
      formattedBudget: `$${(totalBudget / 100).toFixed(2)}`,
      formattedSpent: `$${(totalSpent / 100).toFixed(2)}`,
      formattedRemaining: `$${(totalRemaining / 100).toFixed(2)}`,
    };
  }, [dashboard]);

  // Aggregate transactions by date for trend chart - current month only
  const trendData = useMemo(() => {
    const dailyTotals = new Map<string, number>();
    
    // Filter transactions for current month only
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1).getTime();
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).getTime();
    
    const currentMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.occurredAt).getTime();
      return txDate >= monthStart && txDate <= monthEnd;
    });
    
    currentMonthTransactions.forEach(tx => {
      const date = new Date(tx.occurredAt).toISOString().split('T')[0];
      const current = dailyTotals.get(date) || 0;
      dailyTotals.set(date, current + Math.abs(tx.amountCents));
    });

    const sortedDates = Array.from(dailyTotals.keys()).sort();
    
    return sortedDates.map(date => {
      const d = new Date(date);
      const amount = (dailyTotals.get(date) || 0) / 100;
      return {
        date,
        amount,
        comparison: amount * 0.7,
        formattedDate: `${d.getMonth() + 1}/${d.getDate()}`,
      };
    });
  }, [transactions]);

  // Aggregate by day of week for weekly chart - current month only
  const weeklyData: WeeklyDataPoint[] = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekTotals = new Map<string, number>();
    
    // Filter transactions for current month only
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1).getTime();
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).getTime();
    
    const currentMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.occurredAt).getTime();
      return txDate >= monthStart && txDate <= monthEnd;
    });
    
    currentMonthTransactions.forEach(tx => {
      const day = dayNames[new Date(tx.occurredAt).getDay()];
      const current = weekTotals.get(day) || 0;
      weekTotals.set(day, current + Math.abs(tx.amountCents));
    });

    return dayNames.map(day => ({
      day,
      amount: (weekTotals.get(day) || 0) / 100,
    }));
  }, [transactions]);

  const categoryColors = [
    "#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981",
    "#3B82F6", "#A855F7", "#EF4444", "#F97316", "#14B8A6"
  ];

  const categoryData: CategoryChartData[] = useMemo(() => {
    const data = dashboard?.categories?.map((cat, idx) => ({
      name: cat.categoryName,
      value: cat.totalSpentCents,
      color: categoryColors[idx % categoryColors.length],
      icon: cat.categoryIcon,
      percentage: 0,
    })) ?? [];

    const total = data.reduce((sum, cat) => sum + cat.value, 0);
    return data.map(cat => ({
      ...cat,
      percentage: total > 0 ? (cat.value / total) * 100 : 0,
    }));
  }, [dashboard]);

  const total = categoryData.reduce((sum, cat) => sum + cat.value, 0);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.breadcrumb}>Pages / Dashboard</p>
          <h1 className={styles.pageTitle}>Main Dashboard</h1>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className={styles.topStatsRow}>
        <StatCard
          title="Total Budget"
          value={stats.formattedBudget}
          icon={<span className={styles.iconChart}>📊</span>}
        />
        <StatCard
          title="Total Spent"
          value={stats.formattedSpent}
          icon={<span className={styles.iconDollar}>💵</span>}
          change={`${stats.percentageUsed > 0 ? '+' : ''}${stats.percentageUsed.toFixed(1)}%`}
          isPositive={false}
        />
        <StatCard
          title="Remaining Budget"
          value={stats.formattedRemaining}
          icon={<span className={styles.iconWallet}>💰</span>}
        />
        <div className={styles.taskCard}>
          <div className={styles.taskIcon}>✓</div>
          <div className={styles.taskInfo}>
            <p className={styles.taskLabel}>Active Categories</p>
            <h3 className={styles.taskValue}>{dashboard?.categories.length || 0}</h3>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        {/* Monthly Spending Overview */}
        <div className={styles.trendCard}>
          <div className={styles.trendHeader}>
            <div className={styles.trendBadge}>
              <span className={styles.calendarIcon}>📅</span>
              <span>This month</span>
            </div>
            <span className={styles.chartIcon}>📊</span>
          </div>
          
          <div className={styles.trendStats}>
            <h2 className={styles.trendValue}>${(stats.totalSpent / 100).toFixed(2)}</h2>
            <div className={styles.trendMeta}>
              <span className={styles.trendLabel}>Total Spent</span>
              <span className={`${styles.trendChange} ${stats.percentageUsed > 0 ? styles.trendUp : ''}`}>
                ▲ +{stats.percentageUsed.toFixed(2)}%
              </span>
            </div>
            <div className={styles.statusBadge}>
              <span className={styles.statusCheck}>✓</span>
              <span>On track</span>
            </div>
          </div>
          
          {trendData.length === 0 ? (
            <div className={styles.emptyChart}>
              <p>No transaction data</p>
            </div>
          ) : (
            <div className={styles.smoothChartWrapper}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData} margin={{ top: 20, right: 20, bottom: 5, left: 50 }}>
                  <YAxis
                    stroke="#CBD5E1"
                    style={{ fontSize: '0.75rem', fontWeight: '500' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                    width={40}
                  />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#CBD5E1"
                    style={{ fontSize: '0.75rem', fontWeight: '500' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#4318FF',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '8px 16px',
                      color: 'white',
                      fontWeight: '700'
                    }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#4318FF"
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 8, fill: 'white', stroke: '#4318FF', strokeWidth: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="comparison"
                    stroke="#6AD2FF"
                    strokeWidth={4}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Day of Week Analysis */}
        <div className={styles.weeklyCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Day of Week Analysis</h2>
            <span className={styles.chartIcon}>📊</span>
          </div>
          
          <div className={styles.dayList}>
            {weeklyData
              .map(day => ({
                ...day,
                fullName: day.day === 'Sun' ? 'Sunday' :
                         day.day === 'Mon' ? 'Monday' :
                         day.day === 'Tue' ? 'Tuesday' :
                         day.day === 'Wed' ? 'Wednesday' :
                         day.day === 'Thu' ? 'Thursday' :
                         day.day === 'Fri' ? 'Friday' : 'Saturday'
              }))
              .sort((a, b) => b.amount - a.amount)
              .map((day, i) => {
                const maxAmount = Math.max(...weeklyData.map(d => d.amount));
                const percentage = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                return (
                  <div key={i} className={styles.dayItem}>
                    <div className={styles.dayInfo}>
                      <div className={styles.dayName}>{day.fullName}</div>
                      <div className={styles.dayBar}>
                        <div
                          className={styles.dayBarFill}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className={styles.dayAmount}>${day.amount.toFixed(0)}</div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Spending by Category - Donut Chart */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Spending by Category</h2>
            <span className={styles.cardSubtitle}>This Month</span>
          </div>
          
          {categoryData.length === 0 ? (
            <div className={styles.emptyChart}>
              <p>No spending data</p>
              <button
                className={styles.addBtn}
                onClick={() => router.push('/transactions')}
              >
                Add Transaction
              </button>
            </div>
          ) : (
            <div className={styles.donutSection}>
              <div className={styles.donutWrapper}>
                <svg viewBox="0 0 200 200" className={styles.donutChart}>
                  {categoryData.length === 1 ? (
                    // Single category - render full donut
                    <>
                      <circle cx="100" cy="100" r="80" fill={categoryData[0].color} />
                      <circle cx="100" cy="100" r="50" fill="white" />
                    </>
                  ) : (
                    // Multiple categories - render donut slices
                    (() => {
                      let angle = -90;
                      return categoryData.map((cat, i) => {
                        const slice = (cat.value / total) * 360;
                        const start = angle;
                        angle += slice;
                        const startRad = (Math.PI * start) / 180;
                        const endRad = (Math.PI * angle) / 180;
                        
                        const x1 = 100 + 80 * Math.cos(startRad);
                        const y1 = 100 + 80 * Math.sin(startRad);
                        const x2 = 100 + 80 * Math.cos(endRad);
                        const y2 = 100 + 80 * Math.sin(endRad);
                        
                        const ix1 = 100 + 50 * Math.cos(startRad);
                        const iy1 = 100 + 50 * Math.sin(startRad);
                        const ix2 = 100 + 50 * Math.cos(endRad);
                        const iy2 = 100 + 50 * Math.sin(endRad);
                        
                        const large = slice > 180 ? 1 : 0;
                        
                        return (
                          <path
                            key={i}
                            d={`M ${x1} ${y1} A 80 80 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A 50 50 0 ${large} 0 ${ix1} ${iy1} Z`}
                            fill={cat.color}
                          />
                        );
                      });
                    })()
                  )}
                </svg>
              </div>
              
              <div className={styles.donutLegend}>
                {categoryData.map((cat, i) => (
                  <div key={i} className={styles.donutLegendItem}>
                    <div className={styles.donutLegendLabel}>
                      <span className={styles.donutDot} style={{ background: cat.color }} />
                      <span className={styles.donutCategoryName}>{cat.icon} {cat.name}</span>
                    </div>
                    <div className={styles.donutPercentage}>{cat.percentage.toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Calendar */}
        <CalendarCard transactions={transactions} />
      </div>

      {/* Bottom Row */}
      <div className={styles.bottomRow}>
        <div className={styles.actionCard}>
          <div className={styles.actionContent}>
            <div className={styles.actionIcon}>💡</div>
            <div>
              <h3 className={styles.actionTitle}>Quick Actions</h3>
              <p className={styles.actionText}>Manage your budget efficiently</p>
            </div>
          </div>
          <button 
            className={styles.primaryButton}
            onClick={() => router.push('/transactions')}
          >
            Add Transaction
          </button>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.fingerprint}>🔐</div>
          <h3 className={styles.infoTitle}>Secure Budget Tracking</h3>
          <p className={styles.infoText}>Your financial data is encrypted and secure</p>
          <button 
            className={styles.secondaryButton}
            onClick={() => router.push('/budget')}
          >
            Manage Budgets
          </button>
        </div>
      </div>
    </div>
  );
}