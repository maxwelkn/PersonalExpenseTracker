import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { MonthlyReport, ExceededBudget, Budget } from '../types';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#14b8a6', '#0ea5e9', '#8b5cf6', '#f59e0b', '#f43f5e', '#84cc16'];

export const Dashboard = () => {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [exceeded, setExceeded] = useState<ExceededBudget[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, exceededRes] = await Promise.all([
          apiClient.get(`/reports/monthly?month=${currentMonth}&year=${currentYear}&top=3`),
          apiClient.get(`/budgets/exceeded?month=${currentMonth}&year=${currentYear}`)
        ]);
        setReport(reportRes.data);
        setExceeded(exceededRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentMonth, currentYear]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const hasReportData = report && report.totalSpent > 0;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Spent */}
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Total Spent this Month</dt>
                <dd className="text-2xl font-bold text-slate-900">${report?.totalSpent.toFixed(2) || '0.00'}</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Card 2: Comparison */}
        <div className="card p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${report && report.differenceFromPreviousMonth > 0 ? 'bg-danger/10' : 'bg-success/10'}`}>
              {report && report.differenceFromPreviousMonth > 0 ? (
                <TrendingUp className="h-6 w-6 text-danger" />
              ) : (
                <TrendingDown className="h-6 w-6 text-success" />
              )}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Vs Previous Month</dt>
                <dd className="text-lg font-bold text-slate-900 flex items-baseline">
                  {report && report.differenceFromPreviousMonth > 0 ? '+' : ''}
                  ${report?.differenceFromPreviousMonth.toFixed(2) || '0.00'}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Card 3: Exceeded Budgets */}
        <div className="card p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${exceeded.length > 0 ? 'bg-danger/10' : 'bg-success/10'}`}>
              <AlertTriangle className={`h-6 w-6 ${exceeded.length > 0 ? 'text-danger' : 'text-success'}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Exceeded Budgets</dt>
                <dd className="text-2xl font-bold text-slate-900">{exceeded.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Card 4: Top Category */}
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <PieChartIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Top Category</dt>
                <dd className="text-lg font-bold text-slate-900 truncate">
                  {report?.topCategories?.[0]?.categoryName || 'N/A'}
                </dd>
                {report?.topCategories?.[0] && (
                  <dd className="text-sm text-slate-500">${report.topCategories[0].totalSpent.toFixed(2)}</dd>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Category Breakdown</h3>
          {!hasReportData ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <PieChartIcon className="h-12 w-12 text-slate-300 mb-2" />
              <p>No expense data for this month</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={report.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="totalSpent"
                    nameKey="categoryName"
                  >
                    {report.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Categories List */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Top Categories</h3>
          {!hasReportData ? (
             <div className="text-sm text-slate-500 text-center py-10">No categories found.</div>
          ) : (
            <div className="space-y-4">
              {report.topCategories.map((cat, idx) => (
                <div key={cat.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-medium mr-3">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{cat.categoryName}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">${cat.totalSpent.toFixed(2)}</div>
                    <div className="text-xs text-slate-500">{cat.percentageOfTotal}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exceeded Budgets Status */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Budget Alerts</h3>
        {exceeded.length === 0 ? (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-success text-sm flex items-center">
            <TrendingDown className="w-5 h-5 mr-2" />
            All budgets are under control.
          </div>
        ) : (
          <div className="space-y-4">
            {exceeded.map(exc => (
              <div key={exc.categoryId} className="bg-danger/5 border border-danger/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-slate-900">{exc.categoryName}</div>
                  <div className="text-sm font-bold text-danger">EXCEEDED BY ${exc.exceededAmount.toFixed(2)}</div>
                </div>
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>Spent: ${exc.spentAmount.toFixed(2)}</span>
                  <span>Budget: ${exc.budgetAmount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div className="bg-danger h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <div className="text-right text-xs text-danger mt-1 font-medium">{exc.percentageConsumed}%</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
