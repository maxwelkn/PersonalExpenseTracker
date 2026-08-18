import React, { useEffect, useState, useRef } from 'react';
import { apiClient } from '../api/client';
import { Expense, Category, PaymentMethod, ImportResult } from '../types';
import { Edit2, Trash2, Plus, Upload, Filter, X, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCat, setFilterCat] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [expRes, catRes, methRes] = await Promise.all([
        apiClient.get('/expenses'),
        apiClient.get('/categories'),
        apiClient.get('/paymentmethods')
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
      setMethods(methRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'Unknown';
  const getMethodName = (id: number) => methods.find(m => m.id === id)?.name || 'Unknown';

  const filteredExpenses = expenses.filter(e => {
    if (filterCat && e.categoryId.toString() !== filterCat) return false;
    if (filterMethod && e.paymentMethodId.toString() !== filterMethod) return false;
    if (filterSearch && !e.description.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    return true;
  });

  const clearFilters = () => {
    setFilterCat('');
    setFilterMethod('');
    setFilterSearch('');
  };

  const openAddModal = () => {
    setCurrentExpense(null);
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setCategoryId(categories[0]?.id.toString() || '');
    setPaymentMethodId(methods[0]?.id.toString() || '');
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setCurrentExpense(exp);
    setAmount(exp.amount.toString());
    setDate(exp.date.split('T')[0]);
    setDescription(exp.description);
    setCategoryId(exp.categoryId.toString());
    setPaymentMethodId(exp.paymentMethodId.toString());
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
      date: new Date(date).toISOString(),
      description,
      categoryId: Number(categoryId),
      paymentMethodId: Number(paymentMethodId)
    };

    try {
      if (currentExpense) {
        await apiClient.put(`/expenses/${currentExpense.id}`, payload);
        toast.success('Expense updated');
      } else {
        await apiClient.post('/expenses', payload);
        toast.success('Expense created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      // Handled globally
    }
  };

  const openDeleteModal = (exp: Expense) => {
    setExpenseToDelete(exp);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await apiClient.delete(`/expenses/${expenseToDelete.id}`);
      toast.success('Expense deleted');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      setIsDeleteModalOpen(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append('file', importFile);
    try {
      const { data } = await apiClient.post('/expenses/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(data);
      if (data.importedRows > 0) {
        toast.success(`Imported ${data.importedRows} expenses`);
        fetchData();
      }
      if (data.failedRows === 0) {
        setTimeout(() => setIsImportModalOpen(false), 2000);
      }
    } catch (error) {
      // Handled globally
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Expenses</h2>
          <p className="text-sm text-slate-500">Track and manage your expenses</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => { setImportFile(null); setImportResult(null); setIsImportModalOpen(true); }} className="btn btn-secondary">
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </button>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <label className="label text-xs">Search Description</label>
            <input 
              type="text" 
              className="input h-10" 
              placeholder="Search..." 
              value={filterSearch} 
              onChange={e => setFilterSearch(e.target.value)} 
            />
          </div>
          <div className="w-full md:w-1/4">
            <label className="label text-xs">Category</label>
            <select className="input h-10" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="w-full md:w-1/4">
            <label className="label text-xs">Payment Method</label>
            <select className="input h-10" value={filterMethod} onChange={e => setFilterMethod(e.target.value)}>
              <option value="">All Methods</option>
              {methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="w-full md:w-auto">
            <button onClick={clearFilters} className="btn btn-secondary h-10 w-full md:w-auto">
              <X className="w-4 h-4 mr-2" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <Receipt className="w-12 h-12 text-slate-300 mb-3" />
            <p>No expenses found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(exp.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {exp.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {getCategoryName(exp.categoryId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {getMethodName(exp.paymentMethodId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 text-right">
                      ${exp.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEditModal(exp)} className="text-primary-600 hover:text-primary-900 mr-4">
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => openDeleteModal(exp)} className="text-danger hover:text-red-900">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{currentExpense ? 'Edit Expense' : 'New Expense'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Amount</label>
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
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  {categories.length === 0 && <option value="">No categories available</option>}
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select className="input" required value={paymentMethodId} onChange={(e) => setPaymentMethodId(e.target.value)}>
                  {methods.length === 0 && <option value="">No methods available</option>}
                  {methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={categories.length === 0 || methods.length === 0}>
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
            <h3 className="text-lg font-bold text-danger mb-4">Delete Expense?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this expense of ${expenseToDelete?.amount.toFixed(2)}? This action cannot be undone.
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

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Import from Excel</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {!importResult ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center hover:bg-slate-50 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="mt-4 flex text-sm text-slate-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input type="file" className="sr-only" accept=".xlsx" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">XLSX up to 10MB</p>
                    {importFile && (
                      <div className="mt-4 text-sm font-medium text-slate-900 bg-slate-100 py-2 px-4 rounded inline-block">
                        {importFile.name}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-slate-900">{importResult.totalRows}</div>
                      <div className="text-xs text-slate-500 uppercase font-medium">Total Rows</div>
                    </div>
                    <div className="bg-success/10 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-success">{importResult.importedRows}</div>
                      <div className="text-xs text-success uppercase font-medium">Imported</div>
                    </div>
                    <div className="bg-danger/10 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-danger">{importResult.failedRows}</div>
                      <div className="text-xs text-danger uppercase font-medium">Failed</div>
                    </div>
                  </div>
                  
                  {importResult.errors.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-bold text-slate-900 mb-3">Failed Rows Detail</h4>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Row</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Field</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Error</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200 text-sm">
                            {importResult.errors.map((err, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2 font-medium">{err.rowNumber}</td>
                                <td className="px-4 py-2 text-slate-600">{err.fieldName}</td>
                                <td className="px-4 py-2 text-danger">{err.errorMessage}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <button type="button" onClick={() => setIsImportModalOpen(false)} className="btn btn-secondary">
                {importResult ? 'Close' : 'Cancel'}
              </button>
              {!importResult && (
                <button type="button" onClick={handleImport} className="btn btn-primary" disabled={!importFile || importing}>
                  {importing ? 'Importing...' : 'Start Import'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
