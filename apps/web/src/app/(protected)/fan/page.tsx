'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { useAppStore } from '../../../stores/appStore';
import { useSelectionStore } from '../../../stores/selectionStore';
import { useWebSocketStore } from '../../../stores/wsStore';
import { useNotificationStore } from '../../../stores/notificationStore';
import { useAuthStore } from '../../../stores/authStore';
import { DigitalTwinView } from '../../../components/digital-twin/DigitalTwinView';
import { NotificationCenter } from '../../../components/domain/NotificationCenter';
import {
  MapPin, AlertTriangle, ShieldAlert, Navigation, PhoneCall,
  Accessibility, HeartPulse, Clock, Sparkles, CheckCircle2, ChevronRight,
  Info, Users, LogOut, Calendar, Building2
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function FanDashboard() {
  const queryClient = useQueryClient();
  const { venueId } = useAppStore();
  const { selectedNodeId, setSelectedNode, highlightedPath, setHighlightedPath } = useSelectionStore();
  const isConnected = useWebSocketStore(state => state.isConnected);
  const addNotification = useNotificationStore(state => state.addNotification);

  // Set persona to 'fan' on load to route notifications correctly
  useEffect(() => {
    useAuthStore.getState().setAuth('fan-token', { email: 'fan@stadiumstan.demo', role: 'fan' });

    // Clear path highlighting on mount
    setHighlightedPath([]);
  }, [setHighlightedPath]);

  // States
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  const [routingType, setRoutingType] = useState<'shortest' | 'safest' | 'accessible'>('shortest');

  // Incident submission states
  const [isReporting, setIsReporting] = useState(false);
  const [reportType, setReportType] = useState('medical_emergency');
  const [reportSeverity, setReportSeverity] = useState('high');
  const [reportNode, setReportNode] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);

  // Fetch twin data for nodes list
  const { data: twinData } = useQuery({
    queryKey: ['twin', venueId],
    queryFn: async () => {
      const response = await api.get(`/venues/${venueId}/twin`);
      return response.data;
    }
  });

  // Fetch incidents for live alerts
  const { data: incidents } = useQuery({
    queryKey: ['global_incidents'],
    queryFn: async () => {
      const res = await api.get('/incidents');
      return res.data;
    },
    refetchInterval: 5000
  });

  const nodes = twinData?.nodes || [];
  const gates = nodes.filter((n: any) => n.node_type === 'gate');
  const activeAlerts = incidents?.filter((i: any) => i.status === 'open' && (i.severity === 'high' || i.severity === 'critical')) || [];

  // Sync selected map node to destination or start node
  useEffect(() => {
    if (selectedNodeId) {
      if (startNode && startNode !== selectedNodeId) {
        setEndNode(selectedNodeId);
      } else {
        setStartNode(selectedNodeId);
      }
    }
  }, [selectedNodeId, startNode]);

  // Calculate wait time dynamically based on node state occupancy
  const getGateWaitTime = (gateNodeId: string) => {
    const nodeObj = nodes.find((n: any) => n.id === gateNodeId);
    const occupancy = nodeObj?.occupancy || 150;
    return Math.max(2, Math.round(occupancy / 20));
  };

  // Identify best suggested gate (open, lowest wait time)
  const suggestedGate = gates
    .filter((g: any) => g.status !== 'closed')
    .sort((a: any, b: any) => getGateWaitTime(a.id) - getGateWaitTime(b.id))[0];

  // Routing assistant mutation
  const calculateRouteMutation = useMutation({
    mutationFn: async () => {
      if (!startNode || !endNode) return;
      const res = await api.post('/agents/analyze', {
        venue_id: venueId,
        context_type: 'routing_request',
        start: startNode,
        end: endNode,
        route_type: routingType
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data && data.route?.path_ids) {
        setHighlightedPath(data.route.path_ids);
        addNotification({
          role: 'fan',
          type: 'operational',
          severity: 'info',
          priority: 'normal',
          title: 'Route Suggested',
          message: data.communication?.fan_message || `Safest route calculated: ETA ${data.route.estimated_time_mins || 5} mins.`
        });
      } else if (data && data.recommendation) {
        // Fallback calculation in case path_ids is empty
        const midNodes = nodes.filter((n: any) => n.node_type === 'corridor').map((n: any) => n.id);
        const path = [startNode, ...midNodes, endNode];
        setHighlightedPath(path);

        addNotification({
          role: 'fan',
          type: 'operational',
          severity: 'info',
          priority: 'normal',
          title: 'Route Suggested',
          message: data.communication?.fan_message || `Route computed: ETA 5 mins.`
        });
      }
    }
  });

  const handleCalculateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    calculateRouteMutation.mutate();
  };

  // Submit Assistance/Incident Request mutation
  const submitIncidentMutation = useMutation({
    mutationFn: async () => {
      if (!reportNode) return;
      const res = await api.post('/incidents', {
        incident_type: reportType,
        severity: reportSeverity,
        node_id: reportNode
      });
      return res.data;
    },
    onSuccess: () => {
      setIsReporting(false);
      setReportDetails('');
      queryClient.invalidateQueries({ queryKey: ['global_incidents'] });

      addNotification({
        role: 'fan',
        type: 'operational',
        severity: 'success',
        priority: 'high',
        title: 'Assistance Dispatched',
        message: 'Your assistance request has been logged. Ops command center has been notified.'
      });
    }
  });

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitIncidentMutation.mutate();
  };

  const quickReport = (type: string, label: string) => {
    setReportType(type);
    setReportSeverity('high');
    if (nodes.length > 0) {
      setReportNode(selectedNodeId || nodes[0].id);
    }
    setIsReporting(true);
  };

  // Auto-recalculate route when twin updates (if a route is active)
  useEffect(() => {
    if (startNode && endNode && calculateRouteMutation.data) {
      const handleSync = () => {
        calculateRouteMutation.mutate();
      };
      window.addEventListener('SYNC_REQUIRED', handleSync);
      return () => window.removeEventListener('SYNC_REQUIRED', handleSync);
    }
  }, [startNode, endNode, calculateRouteMutation.data]);

  // Search filter for reporting dropdown
  const filteredReportNodes = nodes.filter((n: any) =>
    n.name.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
    n.node_type.toLowerCase().includes(reportSearchTerm.toLowerCase())
  );
  const selectedReportNodeObj = nodes.find((n: any) => n.id === reportNode);

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-950 text-white">

      {/* Top Banner Header */}
      <header className="flex h-16 w-full items-center justify-between border-b border-gray-800 bg-gray-900/60 px-6 shrink-0 backdrop-blur-md z-10">
        <Link href="/" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            S
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-tight">Stadium Stan</h1>
            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold font-mono">Interactive Fan Portal</p>
          </div>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] text-gray-500 font-bold uppercase">LIVE EVENT</span>
            <span className="text-xs font-semibold text-gray-300">FIFA World Cup 2026</span>
          </div>
          <div className="h-8 w-px bg-gray-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
            )} />
            <span className="text-xs text-gray-400 font-medium hidden md:inline">
              {isConnected ? 'Telemetry Active' : 'Disconnected'}
            </span>
          </div>
          <NotificationCenter />
          <Link
            href="/"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors border border-transparent"
            title="Return to Landing Page"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 p-6">

        {/* Left Side Panel: Info, Navigation, Assistance Forms (Spans 5 Columns) */}
        <div className="xl:col-span-5 flex flex-col gap-6 overflow-y-auto pr-2 pb-10">

          {/* Live Alerts Marquee */}
          {activeAlerts.length > 0 && (
            <div className="bg-red-950/60 border border-red-900/50 text-red-200 px-4 py-3 text-xs font-bold flex items-center gap-3 rounded-2xl animate-pulse shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <span className="uppercase text-red-400 block text-[10px] tracking-wider font-extrabold">LIVE CRITICAL VENUE ALERT</span>
                <span className="mt-0.5 block">{activeAlerts.map((a: any) => `${a.incident_type.replace(/_/g, ' ').toUpperCase()} reported at ${nodes.find((n: any) => n.id === a.node_id)?.name || a.node_id}`).join(' | ')}</span>
              </div>
            </div>
          )}

          {/* Event & Venue Info Card */}
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-lg backdrop-blur-xl shrink-0">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Upcoming Match</h3>
                <h4 className="text-base font-extrabold text-white mt-0.5">USA vs Argentina</h4>
                <p className="text-xs text-gray-400 mt-1">July 15, 2026 • Kickoff 19:00 EST</p>
              </div>
            </div>

            <div className="border-t border-gray-800/60 pt-4 flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Venue Details</h3>
                <h4 className="text-base font-extrabold text-white mt-0.5">MetLife Stadium</h4>
                <p className="text-xs text-gray-400 mt-1">Capacity: 82,500 • East Rutherford, NJ</p>
              </div>
            </div>
          </div>

          {/* Entry Gates wait times list */}
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-lg backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-3">
              <Users className="w-4 h-4 text-indigo-400" /> Entrance Gate Telemetry
            </h3>

            <div className="flex flex-col gap-3">
              {gates.map((g: any) => {
                const wait = getGateWaitTime(g.id);
                const isSuggested = suggestedGate && suggestedGate.id === g.id;
                return (
                  <div
                    key={g.id}
                    className={cn(
                      "flex justify-between items-center rounded-xl p-3 border transition-all",
                      isSuggested ? "bg-blue-950/20 border-blue-500/50 shadow-md shadow-blue-900/5" : "bg-gray-950/40 border-gray-800/60"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full shrink-0",
                        g.status === 'closed' ? 'bg-red-500' : 'bg-emerald-500'
                      )} />
                      <div>
                        <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
                          {g.name}
                          {isSuggested && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] bg-blue-500/20 border border-blue-500/30 text-blue-400 px-1.5 py-0.5 rounded font-extrabold tracking-widest uppercase">
                              <Sparkles className="w-2 h-2 fill-current" /> Suggested
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-gray-500 block uppercase font-mono mt-0.5">Node ID: {g.id}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {g.status === 'closed' ? (
                        <span className="text-xs text-red-400 font-bold uppercase tracking-wider bg-red-950/40 border border-red-900/30 px-2.5 py-1 rounded">CLOSED</span>
                      ) : (
                        <span className={cn(
                          "text-xs font-mono font-bold px-2.5 py-1 rounded border",
                          wait > 15
                            ? "bg-orange-950/40 text-orange-400 border-orange-900/30"
                            : "bg-emerald-950/40 text-emerald-400 border-emerald-900/30"
                        )}>
                          {wait} min wait
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {gates.length === 0 && (
                <span className="text-xs text-gray-500 text-center py-2">No entrance gates loaded</span>
              )}
            </div>
          </div>

          {/* Interactive Navigation Assistant */}
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-lg backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-3">
              <Navigation className="w-4 h-4 text-blue-400" /> Navigation Assistant
            </h3>

            <form onSubmit={handleCalculateRoute} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Start Location</label>
                  <select
                    value={startNode}
                    onChange={(e) => setStartNode(e.target.value)}
                    className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select start node...</option>
                    {nodes.map((n: any) => (
                      <option key={n.id} value={n.id}>{n.name} ({n.node_type})</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Destination</label>
                  <select
                    value={endNode}
                    onChange={(e) => setEndNode(e.target.value)}
                    className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select destination...</option>
                    {nodes.map((n: any) => (
                      <option key={n.id} value={n.id}>{n.name} ({n.node_type})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Route Filters */}
              <div className="flex gap-2 mt-1">
                {(['shortest', 'safest', 'accessible'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRoutingType(type)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg border text-[11px] font-bold uppercase transition-all",
                      routingType === type
                        ? "bg-blue-600/10 border-blue-500 text-blue-400"
                        : "bg-transparent border-gray-800 text-gray-400 hover:border-gray-700"
                    )}
                  >
                    {type === 'accessible' ? '♿ Accessible' : type}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={calculateRouteMutation.isPending || !startNode || !endNode}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 mt-2 shadow-lg shadow-blue-900/10"
              >
                {calculateRouteMutation.isPending ? 'Calculating...' : 'Generate Route'}
              </button>
            </form>

            {/* Route Result Display */}
            {calculateRouteMutation.data && (
              <div className="bg-gray-950/85 border border-gray-800 rounded-xl p-3.5 flex flex-col gap-2.5 animate-in fade-in duration-300">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">DIRECTIONS RESULT</span>
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> ~{calculateRouteMutation.data.route?.estimated_time_mins || 5} mins
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed font-semibold italic">
                  "{calculateRouteMutation.data.communication?.fan_message}"
                </p>

                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  {calculateRouteMutation.data.route?.path_names?.map((step: string, idx: number, arr: any[]) => (
                    <React.Fragment key={idx}>
                      <span className="text-[10px] bg-gray-900 border border-gray-850 rounded px-2 py-1 text-gray-300 font-medium">
                        {step}
                      </span>
                      {idx < arr.length - 1 && <ChevronRight className="w-3 h-3 text-gray-650" />}
                    </React.Fragment>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setHighlightedPath([]);
                    setStartNode('');
                    setEndNode('');
                    calculateRouteMutation.reset();
                  }}
                  className="text-[10px] text-gray-500 hover:text-white transition-colors self-end mt-1"
                >
                  Clear route guidance
                </button>
              </div>
            )}
          </div>

          {/* Quick Assistance & Reports Grid */}
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-lg backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-3">
              <HeartPulse className="w-4 h-4 text-red-500" /> Assistance & Reporting
            </h3>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => quickReport('medical_emergency', 'Medical Help')}
                className="p-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-900/50 rounded-xl flex items-center gap-2.5 transition-all text-left group cursor-pointer"
              >
                <div className="h-8 w-8 rounded-lg bg-red-900/40 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                  <HeartPulse className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">Medical Help</span>
                  <span className="text-[9px] text-gray-400">Request first aid responder</span>
                </div>
              </button>

              <button
                onClick={() => quickReport('security_issue', 'Security Alert')}
                className="p-3 bg-orange-950/20 hover:bg-orange-950/40 border border-orange-900/30 hover:border-orange-900/50 rounded-xl flex items-center gap-2.5 transition-all text-left group cursor-pointer"
              >
                <div className="h-8 w-8 rounded-lg bg-orange-900/40 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">Security Alert</span>
                  <span className="text-[9px] text-gray-400">Report suspicious behavior</span>
                </div>
              </button>

              <button
                onClick={() => quickReport('accessibility_assistance', 'Accessibility')}
                className="p-3 bg-blue-950/20 hover:bg-blue-950/40 border border-blue-900/30 hover:border-blue-900/50 rounded-xl flex items-center gap-2.5 transition-all text-left group cursor-pointer"
              >
                <div className="h-8 w-8 rounded-lg bg-blue-900/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Accessibility className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">Accessibility Help</span>
                  <span className="text-[9px] text-gray-400">Request wheelchair help</span>
                </div>
              </button>

              <button
                onClick={() => quickReport('crowd_congestion', 'Overcrowding')}
                className="p-3 bg-yellow-950/20 hover:bg-yellow-950/40 border border-yellow-900/30 hover:border-yellow-900/50 rounded-xl flex items-center gap-2.5 transition-all text-left group cursor-pointer"
              >
                <div className="h-8 w-8 rounded-lg bg-yellow-900/40 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">Overcrowding</span>
                  <span className="text-[9px] text-gray-400">Report congestion corridor</span>
                </div>
              </button>
            </div>

            {/* Assistance Form Drawer */}
            {isReporting && (
              <form onSubmit={handleReportSubmit} className="bg-gray-950/70 border border-gray-800 rounded-xl p-4 flex flex-col gap-3.5 mt-2 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                  <span className="text-xs font-bold text-red-400">Request Details Form</span>
                  <button type="button" onClick={() => setIsReporting(false)} className="text-gray-500 hover:text-white">✕</button>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Assistance Type</label>
                    <select
                      value={reportType}
                      onChange={e => setReportType(e.target.value)}
                      className="bg-gray-900 border border-gray-800 rounded p-1.5 text-xs text-white outline-none focus:border-red-500"
                    >
                      <option value="medical_emergency">Medical Emergency</option>
                      <option value="lost_person">Lost Child / Person</option>
                      <option value="accessibility_assistance">Accessibility Assistance</option>
                      <option value="security_issue">Security Incident</option>
                      <option value="crowd_congestion">Corridor Block / Overcrowding</option>
                    </select>
                  </div>

                  <div className="relative">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Select Nearest Node Location</label>
                    <div
                      onClick={() => setIsReportDropdownOpen(!isReportDropdownOpen)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white text-xs cursor-pointer flex justify-between items-center"
                    >
                      <span className="truncate">{selectedReportNodeObj ? `${selectedReportNodeObj.name} (${selectedReportNodeObj.node_type})` : 'Select location node...'}</span>
                      <span className="text-gray-500 text-[10px]">▼</span>
                    </div>

                    {isReportDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
                        <input
                          type="text"
                          placeholder="Search node..."
                          value={reportSearchTerm}
                          onChange={e => setReportSearchTerm(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          className="w-full bg-gray-950 border border-gray-700 rounded p-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-red-500"
                          autoFocus
                        />
                        <div className="flex flex-col gap-0.5 mt-1 overflow-y-auto max-h-40">
                          {filteredReportNodes.map((n: any) => (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => {
                                setReportNode(n.id);
                                setIsReportDropdownOpen(false);
                                setReportSearchTerm('');
                              }}
                              className={cn(
                                "w-full text-left px-2 py-1.5 rounded text-xs transition-colors hover:bg-gray-800",
                                reportNode === n.id ? "bg-red-950/40 text-red-400 font-bold border border-red-900/30" : "text-gray-300"
                              )}
                            >
                              {n.name} <span className="text-[10px] text-gray-500 uppercase">({n.node_type})</span>
                            </button>
                          ))}
                          {filteredReportNodes.length === 0 && (
                            <span className="text-gray-500 text-xs p-2 text-center">No nodes found</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitIncidentMutation.isPending || !reportNode}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors shadow-lg shadow-red-900/10"
                >
                  {submitIncidentMutation.isPending ? 'Logging Request...' : 'Submit Request Alert'}
                </button>
              </form>
            )}
          </div>

          {/* Emergency Info & Contacts */}
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-5 flex flex-col gap-3 shadow-lg backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-3">
              <PhoneCall className="w-4 h-4 text-emerald-400" /> Emergency Hotline
            </h3>

            <div className="flex flex-col gap-2.5 text-xs text-gray-400">
              <div className="flex items-center justify-between p-2 bg-gray-950/50 border border-gray-900 rounded-lg">
                <span>stadium control center</span>
                <span className="font-mono text-white font-bold">+1 (800) 555-STAN</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-950/50 border border-gray-900 rounded-lg">
                <span>first aid emergency</span>
                <span className="font-mono text-red-400 font-bold">+1 (800) 555-4AID</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed text-center mt-1">
                If you have an immediate safety concern, report it via the quick assist buttons or contact any field staff.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Map Canvas View (Spans 7 Columns) */}
        <div className="xl:col-span-7 flex flex-col gap-4 overflow-hidden h-full min-h-[500px]">
          {/* Map Heading */}
          <div className="flex items-center justify-between px-2 shrink-0">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400 animate-bounce" />
              <h2 className="text-base font-bold text-white">Live Stadium Map</h2>
            </div>
            <div className="text-xs text-gray-400 bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1">
              Select nodes to calculate routes
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 relative bg-gray-950 rounded-2xl overflow-hidden border border-gray-800/80 shadow-2xl">
            <DigitalTwinView compact={true} />

            {/* Fan Map Legend overlay */}
            <div className="absolute bottom-4 left-4 z-10 bg-gray-950/90 border border-gray-800 rounded-xl p-3 flex flex-col gap-1.5 shadow-xl backdrop-blur text-[10px] text-gray-400">
              <span className="font-bold text-gray-300 uppercase tracking-wider mb-1 border-b border-gray-900 pb-0.5">Map Amenities</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-400/50" />
                <span>Entry Gates (Wait Times)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-red-500 border border-red-400/50" />
                <span>First Aid / Medical Clinic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-500 border border-blue-400/50" />
                <span>Amenities (Food, Restroom)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-yellow-500 border border-yellow-400/50" />
                <span>Section Nodes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-500" />
                <span>Active Safety Route Path</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
