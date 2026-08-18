import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Budget, BudgetProgress, Category } from '../types';
import { Edit2, Trash2, Plus, PiggyBank, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Budgets = () => {
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<BudgetProgress | null>(null);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetProgress | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [budgetsRes, categoriesRes] = await Promise.all([
        apiClient.get('/budgets'),
        apiClient.get('/categories')
      ]);
      const allBudgets: Budget[] = budgetsRes.data;
      setCategories(categoriesRes.data);
      
      // Filter by selected month/year
      const filtered = allBudgets.filter(b => b.month === month && b.year === year);
      
      // Fetch progress for each filtered budget
      const progressPromises = filtered.map(b => apiClient.get(`/budgets/${b.id}/progress`));
      const progressResponses = await Promise.all(progressPromises);
      
      setBudgets(progressResponses.map(res => res.data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const openAddModal = () => {
    setCurrentBudget(null);
    setAmount('');
    setCategoryId(categories[0]?.id.toString() || '');
    setIsModalOpen(true);
  };

  const openEditModal = (budget: BudgetProgress) => {
    setCurrentBudget(budget);
    setAmount(budget.amount.toString());
    setCategoryId(budget.categoryId.toString());
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    const payload = {
      amount: Number(amount),
      month,
      year,
      categoryId: Number(categoryId)
    };

    try {
      if (currentBudget) {
        await apiClient.put(`/budgets/${currentBudget.id}`, payload);
        toast.success('Budget updated');
      } else {
        await apiClient.post('/budgets', payload);
        toast.success('Budget created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      // Handled by client
    }
  };

  const openDeleteModal = (budget: BudgetProgress) => {
    setBudgetToDelete(budget);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!budgetToDelete) return;
    try {
      await apiClient.delete(`/budgets/${budgetToDelete.id}`);
      toast.success('Budget deleted');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      setIsDeleteModalOpen(false);
    }
  };

  const renderProgressBar = (budget: BudgetProgress) => {
    let colorClass = 'bg-success';
    let icon = <CheckCircle2 className="w-5 h-5 text-success" />;
    
    if (budget.isExceeded) {
      colorClass = 'bg-danger';
      icon = <AlertTriangle className="w-5 h-5 text-danger" />;
    } else if (budget.alertThreshold === 100) {
      colorClass = 'bg-danger';
      icon = <AlertCircle className="w-5 h-5 text-danger" />;
    } else if (budget.alertThreshold === 80) {
      colorClass = 'bg-warning';
      icon = <AlertCircle className="w-5 h-5 text-warning" />;
    } else if (budget.alertThreshold === 50) {
      colorClass = 'bg-yellow-400';
      icon = <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }

    const visualPercentage = Math.min(budget.percentageConsumed, 100);

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1 text-sm font-medium">
          <div className="flex items-center gap-2">
            {icon}
            <span className={budget.isExceeded ? 'text-danger font-bold' : 'text-slate-700'}>
              {budget.percentageConsumed}%
            </span>
          </div>
          <span className="text-slate-500">
            ${budget.spentAmount.toFixed(2)} / ${budget.amount.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div className={`${colorClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${visualPercentage}%` }}></div>
        </div>
        {budget.isExceeded && (
          <p className="text-xs text-danger font-semibold mt-1 text-right">
            Exceeded by ${Math.abs(budget.remainingAmount).toFixed(2)}
          </p>
        )}
        {!budget.isExceeded && (
          <p className="text-xs text-slate-500 mt-1 text-right">
            Remaining: ${budget.remainingAmount.toFixed(2)}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Budgets</h2>
          <p className="text-sm text-slate-500">Set limits and track your spending</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Budget
        </button>
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
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 card">Loading...</div>
      ) : budgets.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 flex flex-col items-center">
          <PiggyBank className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No budgets for this period</h3>
          <p className="mb-4">Create your first budget to start tracking.</p>
          <button onClick={openAddModal} className="btn btn-primary">
            Create Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <div key={budget.id} className={`card p-5 border-l-4 ${budget.isExceeded ? 'border-l-danger' : budget.alertThreshold >= 80 ? 'border-l-warning' : 'border-l-success'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{budget.categoryName}</h3>
                  <div className="text-sm font-medium text-slate-500 mt-1">Budget: ${budget.amount.toFixed(2)}</div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openEditModal(budget)} className="text-slate-400 hover:text-primary-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => openDeleteModal(budget)} className="text-slate-400 hover:text-danger">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {renderProgressBar(budget)}
            </div>
          ))}
        </div>
      )}

      {/* Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">{currentBudget ? 'Edit Budget' : 'New Budget'}</h3>
            <p className="text-sm text-slate-500 mb-4">
              Setting budget for {new Date(0, month - 1).toLocaleString('default', { month: 'long' })} {year}
            </p>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Category</label>
                <select 
                  className="input" 
                  required 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={!!currentBudget} // Cannot change category on edit usually
                >
                  {categories.length === 0 && <option value="">No categories available</option>}
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Budget Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={categories.length === 0}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-danger mb-4">Delete Budget?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete the budget for "{budgetToDelete?.categoryName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
