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
    <div className="flex flex-col min-h-screen bg-gray-950 text-white overflow-y-auto">
      
      {/* Background Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Nav */}
      <header className="flex h-16 w-full items-center justify-between border-b border-gray-900 bg-gray-950/60 px-6 sm:px-12 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-blue-500/20">
            S
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight">Stadium Stan</h1>
            <p className="text-[9px] text-purple-400 uppercase tracking-widest font-bold font-mono">v1.0 Candidate</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-900 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            FIFA World Cup 2026 Ready
          </span>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 sm:px-12 py-12 flex flex-col gap-16 relative z-10 w-full">
        
        {/* Title Hero Section */}
        <section className="text-center flex flex-col items-center gap-5 max-w-3xl mx-auto">
          <span className="text-xs font-bold font-mono text-blue-400 bg-blue-950/40 border border-blue-900 px-3 py-1 rounded-full uppercase tracking-wider">
            Autonomous Stadium Operations
          </span>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            Next-Generation Command & Control
          </h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            Stadium Stan coordinates venue crowds, dispatches response personnel, and automates emergency workflows via stateless LangGraph AI agents and dynamic real-time Digital Twin synchronization.
          </p>
        </section>

        {/* Persona Selectors Portal (3 Columns) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fan Portal */}
          <div className="group relative rounded-2xl border border-gray-800 bg-gray-900/40 p-6 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:bg-gray-900/60 hover:-translate-y-1 flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors"></div>
            <div>
              <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Public Fan Portal</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Access interactive stadium maps, live queue wait times, automated gates recommendation, safest accessible routing, and submit assistance emergency requests directly.
              </p>
            </div>
            <Link 
              href="/fan"
              className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
            >
              Enter Fan Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Volunteer Portal */}
          <div className="group relative rounded-2xl border border-gray-800 bg-gray-900/40 p-6 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/50 hover:bg-gray-900/60 hover:-translate-y-1 flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
            <div>
              <div className="h-12 w-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Volunteer Portal</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Field staff operational cockpit. Report on-the-ground incidents, track dynamic checklist assignments, inspect digital twin zones, and follow SOP guidelines.
              </p>
            </div>
            <Link 
              href="/volunteer-login"
              className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
            >
              Enter Volunteer Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Manager Operations Center */}
          <div className="group relative rounded-2xl border border-gray-800 bg-gray-900/40 p-6 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:bg-gray-900/60 hover:-translate-y-1 flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors"></div>
            <div>
              <div className="h-12 w-12 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Operations Command</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                The operations core. Review AI incident recommendations, trigger crowd congestion what-if simulations, inspect connection diagnostics, and reseed demo telemetry database.
              </p>
            </div>
            <Link 
              href="/login"
              className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/20"
            >
              Enter Operations Command <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Tabbed Interactive Information Area */}
        <section className="bg-gray-900/20 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex border-b border-gray-800 pb-3 mb-6 gap-6">
            <button 
              onClick={() => setActiveTab('overview')}
              className={cn("text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-all", activeTab === 'overview' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white')}
            >
              Platform Overview
            </button>
            <button 
              onClick={() => setActiveTab('scenario')}
              className={cn("text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-all", activeTab === 'scenario' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white')}
            >
              E2E Demo Walkthrough
            </button>
            <button 
              onClick={() => setActiveTab('stack')}
              className={cn("text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-all", activeTab === 'stack' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white')}
            >
              Core Architecture
            </button>
          </div>

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <div className="flex flex-col gap-2">
                <h4 className="text-base font-bold text-white flex items-center gap-2"><Network className="w-4 h-4 text-blue-400" /> Digital Twin Canvas</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Real-time synchronization of venue nodes (gates, clinics, sections, food courts). Updates color risk states and congestion occupancy metrics dynamically over persistent WebSockets.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-base font-bold text-white flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-orange-400" /> LangGraph Workflows</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Stateless AI agents trigger SOP validation and query retrieval. Classifies incident urgency and evaluates crowd redirection alternatives to propose the highest risk reduction actions.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-base font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> E2E Dispatch Pipeline</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Bridges manager decision approval directly with field volunteer checklists. Publishes events on EventBus that sync client caches in real-time, requiring zero manual refreshes.
                </p>
              </div>
            </div>
          )}

          {/* Demo Scenario Tab Content */}
          {activeTab === 'scenario' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Follow this E2E scenario in three windows:</p>
              <ol className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-gray-400">
                <li className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex flex-col gap-1">
                  <span className="font-bold text-white">1. Fan Submits Help</span>
                  <span>Fan submits a "Medical Emergency" at Medical Station on Fan Portal.</span>
                </li>
                <li className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex flex-col gap-1">
                  <span className="font-bold text-white">2. AI Recommends Action</span>
                  <span>Incident appears instantly on Manager page. AI recommendation card generates linked action.</span>
                </li>
                <li className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex flex-col gap-1">
                  <span className="font-bold text-white">3. Volunteer dispatches</span>
                  <span>Manager approves action. Volunteer vol-1 receives task assignment on Volunteer dashboard instantly.</span>
                </li>
                <li className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex flex-col gap-1">
                  <span className="font-bold text-white">4. Auto-Resolution Sync</span>
                  <span>Volunteer completes task. Incident resolves automatically. Fan receives resolved notification in real-time.</span>
                </li>
              </ol>
            </div>
          )}

          {/* Core Stack Content */}
          {activeTab === 'stack' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center animate-in fade-in duration-300 text-xs">
              <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex flex-col justify-center">
                <span className="font-bold text-white block">Next.js & React Flow</span>
                <span className="text-[10px] text-gray-500 mt-1">Interlocking nodes UI</span>
              </div>
              <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex flex-col justify-center">
                <span className="font-bold text-white block">FastAPI & Python</span>
                <span className="text-[10px] text-gray-500 mt-1">Async event loops API</span>
              </div>
              <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex flex-col justify-center">
                <span className="font-bold text-white block">PostgreSQL & SQLAlchemy</span>
                <span className="text-[10px] text-gray-500 mt-1">Primary relational storage</span>
              </div>
              <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex flex-col justify-center">
                <span className="font-bold text-white block">EventBus & WebSockets</span>
                <span className="text-[10px] text-gray-500 mt-1">Real-time sync broadcast</span>
              </div>
            </div>
          )}
        </section>

        {/* Live Digital Twin Preview Diagram */}
        <section className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="absolute top-0 right-0 h-40 w-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold text-white">Live Digital Twin Preview</h3>
            <p className="text-xs text-gray-400">Topological view of MetLife Stadium live nodes and risk telemetry mapping.</p>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 items-center justify-center p-6 bg-gray-950/80 rounded-2xl border border-gray-800/80">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/10 text-emerald-400 transition-all hover:scale-105">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-bold">Gate A</span>
              <span className="text-[9px] font-mono opacity-85">Low Risk</span>
            </div>
            
            <div className="h-0.5 bg-gray-800 w-full hidden sm:block relative">
              <span className="absolute top-0 left-0 right-0 bottom-0 bg-blue-500/20 animate-pulse"></span>
            </div>
            
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-yellow-500/30 bg-yellow-950/10 text-yellow-400 transition-all hover:scale-105">
              <Activity className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-[10px] font-bold">Corridor 1</span>
              <span className="text-[9px] font-mono opacity-85">Mod Risk</span>
            </div>
            
            <div className="h-0.5 bg-gray-800 w-full hidden sm:block relative">
              <span className="absolute top-0 left-0 right-0 bottom-0 bg-red-500/20 animate-pulse"></span>
            </div>
            
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-red-500/30 bg-red-950/10 text-red-400 transition-all hover:scale-105 animate-pulse">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span className="text-[10px] font-bold">Section 101</span>
              <span className="text-[9px] font-mono opacity-85">High Congestion</span>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Strip */}
      <footer className="mt-auto h-12 w-full border-t border-gray-900 bg-gray-950 flex items-center justify-center text-xs text-gray-500">
        © 2026 Stadium Stan. All rights reserved. Built for FIFA World Cup 2026.
      </footer>
    </div>
  );
}
