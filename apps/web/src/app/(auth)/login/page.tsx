'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../../../services/auth';
import { ShieldAlert, Info } from 'lucide-react';

export default function LoginPage() {
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
      router.push('/manager');
    } catch (err) {
      setError('Invalid credentials. Please use manager@stadiumstan.demo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div 
        className="w-full max-w-md rounded-lg p-8 border"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div 
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-md"
            style={{ backgroundColor: 'var(--green-primary)' }}
          >
            <span className="text-3xl font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-semibold text-center" style={{ color: 'var(--foreground)' }}>
            Stadium Stan
          </h1>
          <p className="mt-2 text-sm text-center" style={{ color: 'var(--text-tertiary)' }}>
            Operations Command Center
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {error && (
            <div 
              className="flex items-center gap-2 rounded-md p-3 text-sm border"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: 'var(--red-incident)',
              }}
            >
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border px-4 py-2.5 text-sm transition-colors focus:outline-none"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--green-primary)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(61, 155, 95, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200"
            style={{
              background: isLoading ? 'rgba(61, 155, 95, 0.6)' : 'linear-gradient(180deg, var(--green-medium) 0%, var(--green-primary) 100%)',
              opacity: isLoading ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(61, 155, 95, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.opacity = '1';
            }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Info */}
        <div 
          className="mt-6 rounded-md p-4 flex gap-3 border"
          style={{
            backgroundColor: 'rgba(61, 155, 95, 0.08)',
            borderColor: 'rgba(61, 155, 95, 0.3)',
          }}
        >
          <Info className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--green-primary)' }} />
          <div className="text-sm">
            <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Demo Credentials</p>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manager:{' '}
              <span 
                className="font-mono px-1.5 py-0.5 rounded text-xs"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  color: 'var(--green-primary)',
                }}
              >
                manager@stadiumstan.demo
              </span>
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-xs transition-colors duration-200"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            Return to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}

