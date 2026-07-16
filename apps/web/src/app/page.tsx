'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, Shield, Users, Activity, Zap, Cpu, 
  MapPin, CheckCircle2, Server, PlayCircle, Network, ArrowRight
} from 'lucide-react';
import { cn } from '../../src/lib/utils';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'scenario' | 'stack'>('overview');

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      
      {/* Subtle Stadium Accent Background */}
      <div 
        className="fixed top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ 
          background: 'radial-gradient(circle, rgba(209, 184, 52, 0.1) 0%, transparent 70%)',
        }}
      />
      <div 
        className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ 
          background: 'radial-gradient(circle, rgba(109, 133, 23, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Header Nav */}
      <header 
        className="flex h-16 w-full items-center justify-between px-6 sm:px-12 sticky top-0 z-50"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Link href="/" className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-85">
          <div 
            className="h-10 w-10 rounded-md flex items-center justify-center font-bold text-white text-lg"
            style={{ backgroundColor: 'var(--mustard)' }}
          >
            S
          </div>
          <div>
            <h1 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Stadium Stan</h1>
            <p className="text-[9px] uppercase tracking-widest font-bold font-mono" style={{ color: 'var(--mustard)' }}>v1.0</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span 
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              color: 'var(--green-success)',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--green-success)' }} />
            FIFA World Cup 2026 Ready
          </span>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 sm:px-12 py-12 flex flex-col gap-16 relative z-10 w-full">
        
        {/* Title Hero Section */}
        <section className="text-center flex flex-col items-center gap-6 max-w-3xl mx-auto">
          <span 
            className="text-xs font-bold font-mono px-3 py-1.5 rounded-md uppercase tracking-wider border"
            style={{
              backgroundColor: 'rgba(209, 184, 52, 0.1)',
              borderColor: 'rgba(209, 184, 52, 0.3)',
              color: 'var(--mustard)',
            }}
          >
            Autonomous Stadium Operations
          </span>
          <h2 
            className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight"
            style={{ color: 'var(--foreground)' }}
          >
            Next-Generation Command & Control
          </h2>
          <p 
            className="text-sm sm:text-base leading-relaxed max-w-2xl"
            style={{ color: 'var(--text-secondary)' }}
          >
            Stadium Stan coordinates venue crowds, dispatches response personnel, and automates emergency workflows via stateless LangGraph AI agents and dynamic real-time Digital Twin synchronization.
          </p>
        </section>

        {/* Persona Selectors Portal (3 Columns) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fan Portal */}
          <div 
            className="group relative rounded-lg p-6 flex flex-col justify-between min-h-[320px] transition-all duration-200 border"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(109, 133, 23, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(109, 133, 23, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              <div 
                className="h-12 w-12 rounded-md flex items-center justify-center mb-6 border"
                style={{
                  backgroundColor: 'rgba(109, 133, 23, 0.1)',
                  borderColor: 'rgba(109, 133, 23, 0.3)',
                  color: 'var(--olive)',
                }}
              >
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Public Fan Portal</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                Access interactive stadium maps, live queue wait times, automated gates recommendation, safest accessible routing, and submit assistance emergency requests directly.
              </p>
            </div>
            <Link 
              href="/fan"
              className="mt-6 w-full py-2.5 text-white font-medium rounded-md text-xs flex items-center justify-center gap-2 transition-all duration-200 border"
              style={{
                backgroundColor: 'var(--olive)',
                borderColor: 'var(--olive)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Enter Fan Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Volunteer Portal */}
          <div 
            className="group relative rounded-lg p-6 flex flex-col justify-between min-h-[320px] transition-all duration-200 border"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(209, 184, 52, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(209, 184, 52, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              <div 
                className="h-12 w-12 rounded-md flex items-center justify-center mb-6 border"
                style={{
                  backgroundColor: 'rgba(209, 184, 52, 0.1)',
                  borderColor: 'rgba(209, 184, 52, 0.3)',
                  color: 'var(--mustard)',
                }}
              >
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Volunteer Portal</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                Field staff operational cockpit. Report on-the-ground incidents, track dynamic checklist assignments, inspect digital twin zones, and follow SOP guidelines.
              </p>
            </div>
            <Link 
              href="/volunteer-login"
              className="mt-6 w-full py-2.5 text-white font-medium rounded-md text-xs flex items-center justify-center gap-2 transition-all duration-200 border"
              style={{
                backgroundColor: 'var(--mustard)',
                borderColor: 'var(--mustard)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Enter Volunteer Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Manager Operations Center */}
          <div 
            className="group relative rounded-lg p-6 flex flex-col justify-between min-h-[320px] transition-all duration-200 border"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(109, 133, 23, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(109, 133, 23, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              <div 
                className="h-12 w-12 rounded-md flex items-center justify-center mb-6 border"
                style={{
                  backgroundColor: 'rgba(109, 133, 23, 0.1)',
                  borderColor: 'rgba(109, 133, 23, 0.3)',
                  color: 'var(--olive)',
                }}
              >
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Operations Command</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                The operations core. Review AI incident recommendations, trigger crowd congestion what-if simulations, inspect connection diagnostics, and reseed demo telemetry database.
              </p>
            </div>
            <Link 
              href="/login"
              className="mt-6 w-full py-2.5 text-white font-medium rounded-md text-xs flex items-center justify-center gap-2 transition-all duration-200 border"
              style={{
                backgroundColor: 'var(--olive)',
                borderColor: 'var(--olive)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Enter Operations Command <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Tabbed Interactive Information Area */}
        <section 
          className="rounded-lg p-6 sm:p-8 border"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div 
            className="flex pb-4 mb-6 gap-6 border-b"
            style={{ borderBottomColor: 'var(--border-subtle)' }}
          >
            {['overview', 'scenario', 'stack'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className="text-xs font-semibold uppercase tracking-wider pb-3 border-b-2 transition-all duration-200"
                style={{
                  borderBottomColor: activeTab === tab ? 'var(--purple-ai)' : 'transparent',
                  color: activeTab === tab ? 'var(--purple-ai)' : 'var(--text-tertiary)',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }
                }}
              >
                {tab === 'overview' && 'Platform Overview'}
                {tab === 'scenario' && 'E2E Demo Walkthrough'}
                {tab === 'stack' && 'Core Architecture'}
              </button>
            ))}
          </div>

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  <Network className="w-4 h-4" style={{ color: 'var(--blue-primary)' }} /> 
                  Digital Twin Canvas
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  Real-time synchronization of venue nodes (gates, clinics, sections, food courts). Updates color risk states and congestion occupancy metrics dynamically over persistent WebSockets.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  <ShieldAlert className="w-4 h-4" style={{ color: 'var(--amber-warning)' }} /> 
                  LangGraph Workflows
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  Stateless AI agents trigger SOP validation and query retrieval. Classifies incident urgency and evaluates crowd redirection alternatives to propose the highest risk reduction actions.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  <Activity className="w-4 h-4" style={{ color: 'var(--green-success)' }} /> 
                  E2E Dispatch Pipeline
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  Bridges manager decision approval directly with field volunteer checklists. Publishes events on EventBus that sync client caches in real-time, requiring zero manual refreshes.
                </p>
              </div>
            </div>
          )}

          {/* Demo Scenario Tab Content */}
          {activeTab === 'scenario' && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--purple-ai)' }}>
                Follow this E2E scenario in three windows:
              </p>
              <ol className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                {[
                  { num: '1', title: 'Fan Submits Help', desc: 'Fan submits a "Medical Emergency" at Medical Station on Fan Portal.' },
                  { num: '2', title: 'AI Recommends Action', desc: 'Incident appears instantly on Manager page. AI recommendation card generates linked action.' },
                  { num: '3', title: 'Volunteer Dispatches', desc: 'Manager approves action. Volunteer vol-1 receives task assignment on Volunteer dashboard instantly.' },
                  { num: '4', title: 'Auto-Resolution Sync', desc: 'Volunteer completes task. Incident resolves automatically. Fan receives resolved notification in real-time.' }
                ].map((step) => (
                  <li 
                    key={step.num}
                    className="p-4 rounded-lg border flex flex-col gap-2"
                    style={{
                      backgroundColor: 'var(--surface-tertiary)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <span className="font-semibold text-xs" style={{ color: 'var(--foreground)' }}>
                      {step.num}. {step.title}
                    </span>
                    <span style={{ color: 'var(--text-tertiary)' }}>{step.desc}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Core Stack Content */}
          {activeTab === 'stack' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center animate-in fade-in duration-300">
              {[
                { title: 'Next.js & React Flow', desc: 'Interlocking nodes UI' },
                { title: 'FastAPI & Python', desc: 'Async event loops API' },
                { title: 'PostgreSQL & SQLAlchemy', desc: 'Primary relational storage' },
                { title: 'EventBus & WebSockets', desc: 'Real-time sync broadcast' }
              ].map((tech) => (
                <div 
                  key={tech.title}
                  className="p-4 rounded-lg border flex flex-col justify-center gap-2"
                  style={{
                    backgroundColor: 'var(--surface-tertiary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                    {tech.title}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {tech.desc}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Live Digital Twin Preview Diagram */}
        <section 
          className="flex flex-col gap-6 p-6 sm:p-8 rounded-lg border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Live Digital Twin Preview</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Topological view of MetLife Stadium live nodes and risk telemetry mapping.</p>
          </div>
          
          <div 
            className="grid grid-cols-3 sm:grid-cols-5 gap-4 items-center justify-center p-6 rounded-lg border"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {/* Low Risk Node */}
            <div 
              className="flex flex-col items-center gap-1.5 p-3 rounded-md border transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: 'var(--green-success)',
              }}
            >
              <Users className="w-5 h-5" style={{ color: 'var(--green-success)' }} />
              <span className="text-[10px] font-semibold">Gate A</span>
              <span className="text-[9px] font-mono opacity-75">Low Risk</span>
            </div>
            
            <div className="h-0.5 w-full hidden sm:block relative" style={{ backgroundColor: 'var(--border-subtle)' }}>
              <span className="absolute top-0 left-0 right-0 bottom-0" style={{ background: 'rgba(0, 102, 255, 0.2)' }}></span>
            </div>
            
            {/* Medium Risk Node */}
            <div 
              className="flex flex-col items-center gap-1.5 p-3 rounded-md border transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
                color: 'var(--amber-warning)',
              }}
            >
              <Activity className="w-5 h-5" style={{ color: 'var(--amber-warning)' }} />
              <span className="text-[10px] font-semibold">Corridor 1</span>
              <span className="text-[9px] font-mono opacity-75">Mod Risk</span>
            </div>
            
            <div className="h-0.5 w-full hidden sm:block relative" style={{ backgroundColor: 'var(--border-subtle)' }}>
              <span className="absolute top-0 left-0 right-0 bottom-0" style={{ background: 'rgba(239, 68, 68, 0.2)' }}></span>
            </div>
            
            {/* High Risk Node */}
            <div 
              className="flex flex-col items-center gap-1.5 p-3 rounded-md border transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: 'var(--red-incident)',
              }}
            >
              <ShieldAlert className="w-5 h-5" style={{ color: 'var(--red-incident)' }} />
              <span className="text-[10px] font-semibold">Section 101</span>
              <span className="text-[9px] font-mono opacity-75">High Congestion</span>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Strip */}
      <footer 
        className="mt-auto h-12 w-full flex items-center justify-center text-xs border-t"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderTopColor: 'var(--border-subtle)',
          color: 'var(--text-muted)',
        }}
      >
        © 2026 Stadium Stan. All rights reserved. Built for FIFA World Cup 2026.
      </footer>
    </div>
  );
}
