import React, { useEffect, useState } from 'react';
import { apiClient, API_BASE_URL } from '../api/client';
import { MonthlyReport } from '../types';
import { Download, FileText, FileJson, FileSpreadsheet, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#14b8a6', '#0ea5e9', '#8b5cf6', '#f59e0b', '#f43f5e', '#84cc16', '#64748b', '#ec4899'];

export const Reports = () => {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [top, setTop] = useState(5);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/reports/monthly?month=${month}&year=${year}&top=${top}`);
      setReport(data);
    } catch (error) {
      console.error(error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year, top]);

  const handleExport = async (format: 'excel' | 'txt' | 'json') => {
    setExporting(true);
    try {
      const response = await apiClient.get(`/reports/monthly/export?month=${month}&year=${year}&format=${format}`, {
        responseType: 'blob'
      });
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `report_${year}_${month}.${format === 'excel' ? 'xlsx' : format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${format.toUpperCase()} export downloaded`);
    } catch (error) {
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  };

  const hasData = report && report.totalSpent > 0;

  const barChartData = report ? [
    { name: 'Previous Month', amount: report.previousMonthTotal },
    { name: 'Current Month', amount: report.totalSpent }
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Monthly Reports</h2>
          <p className="text-sm text-slate-500">Analyze your spending patterns</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => handleExport('excel')} disabled={exporting || !hasData} className="btn btn-secondary text-success border-success/30 hover:bg-success/5">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </button>
          <button onClick={() => handleExport('txt')} disabled={exporting || !hasData} className="btn btn-secondary text-slate-700">
            <FileText className="w-4 h-4 mr-2" />
            TXT
          </button>
          <button onClick={() => handleExport('json')} disabled={exporting || !hasData} className="btn btn-secondary text-primary-600 border-primary-600/30 hover:bg-primary-50">
            <FileJson className="w-4 h-4 mr-2" />
            JSON
          </button>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="label mb-0 text-xs">Month</label>
          <select className="input h-9 py-1" value={month} onChange={e => setMonth(Number(e.target.value))}>
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="label mb-0 text-xs">Year</label>
          <select className="input h-9 py-1" value={year} onChange={e => setYear(Number(e.target.value))}>
            {[year-1, year, year+1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="label mb-0 text-xs">Top Categories</label>
          <select className="input h-9 py-1" value={top} onChange={e => setTop(Number(e.target.value))}>
            <option value={3}>Top 3</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 card">Generating report...</div>
      ) : !report ? (
        <div className="p-8 text-center text-slate-500 card">Error loading report.</div>
      ) : !hasData ? (
        <div className="card p-12 text-center text-slate-500 flex flex-col items-center">
          <BarChart2 className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No report data for this period</h3>
          <p>There are no expenses recorded for {new Date(0, month - 1).toLocaleString('default', { month: 'long' })} {year}.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <h3 className="text-sm font-medium text-slate-500 mb-1">Total Spent</h3>
              <div className="text-3xl font-bold text-slate-900">${report.totalSpent.toFixed(2)}</div>
            </div>
            <div className="card p-6">
              <h3 className="text-sm font-medium text-slate-500 mb-1">Previous Month</h3>
              <div className="text-3xl font-bold text-slate-900">${report.previousMonthTotal.toFixed(2)}</div>
            </div>
            <div className={`card p-6 ${report.differenceFromPreviousMonth > 0 ? 'bg-danger/5 border-danger/20' : 'bg-success/5 border-success/20'}`}>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Difference</h3>
              <div className={`text-3xl font-bold ${report.differenceFromPreviousMonth > 0 ? 'text-danger' : 'text-success'}`}>
                {report.differenceFromPreviousMonth > 0 ? '+' : ''}${report.differenceFromPreviousMonth.toFixed(2)}
              </div>
              <p className="text-xs mt-1 font-medium">
                {report.differenceFromPreviousMonth > 0 ? 'Spent more than last month' : 'Spent less than last month'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2 text-slate-400" />
                Category Breakdown
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={report.categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="totalSpent"
                      nameKey="categoryName"
                    >
                      {report.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-slate-400" />
                Month Comparison
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <RechartsTooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="amount" fill="#14b8a6" radius={[4, 4, 0, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#94a3b8' : '#14b8a6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Categories Details */}
          <div className="card">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Top Categories Detail</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount Spent</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">% of Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {report.topCategories.map((cat, idx) => (
                    <tr key={cat.categoryId} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {cat.categoryName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 text-right">
                        ${cat.totalSpent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                        <div className="flex items-center justify-end">
                          <span className="mr-2">{cat.percentageOfTotal}%</span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5">
                            <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${cat.percentageOfTotal}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
