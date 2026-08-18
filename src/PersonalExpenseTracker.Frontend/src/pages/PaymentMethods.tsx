import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { PaymentMethod } from '../types';
import { Edit2, Trash2, Plus, CreditCard, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export const PaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod | null>(null);
  const [name, setName] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);

  const fetchMethods = async () => {
    try {
      const { data } = await apiClient.get('/paymentmethods');
      setMethods(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const openAddModal = () => {
    setCurrentMethod(null);
    setName('');
    setIsModalOpen(true);
  };

  const openEditModal = (method: PaymentMethod) => {
    setCurrentMethod(method);
    setName(method.name);
    setIsModalOpen(true);
  };

  const openDeleteModal = (method: PaymentMethod) => {
    setMethodToDelete(method);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentMethod) {
        await apiClient.put(`/paymentmethods/${currentMethod.id}`, { name });
        toast.success('Payment Method updated');
      } else {
        await apiClient.post('/paymentmethods', { name });
        toast.success('Payment Method created');
      }
      setIsModalOpen(false);
      fetchMethods();
    } catch (error) {
      // Handled globally
    }
  };

  const handleDelete = async () => {
    if (!methodToDelete) return;
    try {
      await apiClient.delete(`/paymentmethods/${methodToDelete.id}`);
      toast.success('Payment Method deleted');
      setIsDeleteModalOpen(false);
      fetchMethods();
    } catch (error) {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Payment Methods</h2>
          <p className="text-sm text-slate-500">Manage your ways to pay</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Method
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : methods.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <CreditCard className="w-12 h-12 text-slate-300 mb-3" />
            <p>No payment methods found. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {methods.map((method) => (
                  <tr key={method.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-slate-400" />
                        {method.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEditModal(method)} className="text-primary-600 hover:text-primary-900 mr-4">
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => openDeleteModal(method)} className="text-danger hover:text-red-900">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">{currentMethod ? 'Edit Payment Method' : 'New Payment Method'}</h3>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="label">Method Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center text-danger mb-4">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-bold">Delete Payment Method?</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete "{methodToDelete?.name}"? This action cannot be undone.
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
