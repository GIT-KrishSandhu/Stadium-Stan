'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../../../services/auth';
import { ShieldAlert, Info } from 'lucide-react';

export default function VolunteerLoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authApi.login(email);
      // For legacy compatibility set localStorage
      localStorage.setItem('stadium_stan_volunteer', 'authenticated');
      localStorage.setItem('volunteer_id', 'vol-1');
      router.push('/volunteer');
    } catch (err) {
      setError('Invalid credentials. Please use volunteer1@stadiumstan.demo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-500/20">
            <span className="text-3xl font-bold text-white">V</span>
          </div>
          <h1 className="text-2xl font-bold text-white text-center">Stadium Stan</h1>
          <p className="text-gray-400 mt-2 text-sm text-center">Volunteer Operations Portal</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              <ShieldAlert className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Volunteer Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-950 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-emerald-900/50 bg-emerald-900/20 p-4 flex gap-3">
          <Info className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-200">
            <p className="font-semibold mb-1">Demo Credentials</p>
            <p>Volunteer: <span className="font-mono bg-emerald-950/50 px-1 py-0.5 rounded text-emerald-300">volunteer1@stadiumstan.demo</span></p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">
            Return to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
