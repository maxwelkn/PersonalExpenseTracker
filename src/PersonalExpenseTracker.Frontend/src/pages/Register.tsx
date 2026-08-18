import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../api/client';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/auth/register', { name, email, password });
      toast.success('Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      // API client already handles the error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center text-primary-600 mb-8">
            <Wallet className="h-10 w-10 mr-2" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              ExpenseTracker
            </h2>
          </div>
          
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            Create a new account
          </h2>
          
          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="label">Full Name</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email address</label>
                  <div className="mt-1">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="mt-1">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input"
                      placeholder="At least 6 characters"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full flex justify-center py-2.5"
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-slate-50 px-2 text-slate-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="btn btn-secondary w-full flex justify-center py-2.5"
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1 bg-primary-600">
        <div className="flex flex-col justify-center items-center h-full text-white px-12">
          <h2 className="text-4xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-xl text-primary-100 text-center max-w-lg">
            Join us today and take control of your financial future with smart budgeting and expense tracking.
          </p>
        </div>
      </div>
    </div>
  );
};
