import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Category } from '../types';
import { Edit2, Trash2, Plus, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setCurrentCategory(null);
    setName('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setCurrentCategory(cat);
    setName(cat.name);
    setIsModalOpen(true);
  };

  const openDeleteModal = (cat: Category) => {
    setCategoryToDelete(cat);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentCategory) {
        await apiClient.put(`/categories/${currentCategory.id}`, { name });
        toast.success('Category updated');
      } else {
        await apiClient.post('/categories', { name });
        toast.success('Category created');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      // Error handled by client
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await apiClient.delete(`/categories/${categoryToDelete.id}`);
      toast.success('Category deleted');
      setIsDeleteModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      // 409 will be caught and toasted by client
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500">Manage your expense categories</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Category
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <Tag className="w-12 h-12 text-slate-300 mb-3" />
            <p>No categories found. Create one to get started.</p>
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
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-slate-400" />
                        {cat.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEditModal(cat)} className="text-primary-600 hover:text-primary-900 mr-4">
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => openDeleteModal(cat)} className="text-danger hover:text-red-900">
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
            <h3 className="text-lg font-bold mb-4">{currentCategory ? 'Edit Category' : 'New Category'}</h3>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="label">Category Name</label>
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
              <h3 className="text-lg font-bold">Delete Category?</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
              If it has associated expenses or budgets, the deletion will be rejected.
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

// Also import AlertTriangle at the top
import { AlertTriangle } from 'lucide-react';
