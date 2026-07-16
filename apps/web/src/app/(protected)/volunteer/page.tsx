'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { useVolunteerStore } from '../../../stores/volunteerStore';
import { MapPin, AlertCircle, CheckCircle2, Clock, Map, Play, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function VolunteerDashboard() {
  const { status, setStatus, currentLocationNodeId, setLocation } = useVolunteerStore();
  const queryClient = useQueryClient();
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  // Fetch Assignments
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['volunteer_assignments'],
    queryFn: async () => {
      const res = await api.get('/volunteers/assignments');
      return res.data;
    },
    refetchInterval: 3000
  });

  // Fetch twin nodes to resolve UUIDs to names
  const { data: twinData } = useQuery({
    queryKey: ['twin-nodes', 'metlife'],
    queryFn: async () => {
      const res = await api.get('/venues/metlife/twin');
      return res.data;
    }
  });
  const nodes = twinData?.nodes || [];

  const activeAssignment = assignments?.find((a: any) => 
    ['pending', 'accepted', 'en_route', 'at_location'].includes(a.status)
  );

  // Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await api.post('/volunteers/status', { status: newStatus, location_node_id: currentLocationNodeId });
      setStatus(newStatus);
    }
  });

  // Assignment Lifecycle Mutation
  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string, newStatus: string }) => {
      await api.post(`/volunteers/assignments/${id}/status`, { status: newStatus, location_node_id: currentLocationNodeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteer_assignments'] });
    }
  });

  const handleNextStep = () => {
    if (!activeAssignment) return;
    
    let nextStatus = '';
    switch (activeAssignment.status) {
      case 'pending': nextStatus = 'accepted'; break;
      case 'accepted': nextStatus = 'en_route'; break;
      case 'en_route': nextStatus = 'at_location'; break;
      case 'at_location': nextStatus = 'completed'; break;
    }
    
    if (nextStatus) {
      updateAssignmentMutation.mutate({ id: activeAssignment.id, newStatus: nextStatus });
      // Update global volunteer status automatically to match assignment
      if (nextStatus === 'completed') {
        updateStatusMutation.mutate('available');
      } else {
        updateStatusMutation.mutate('busy');
      }
    }
  };

  const getStepButtonProps = (status: string) => {
    switch (status) {
      case 'pending': return { text: 'Accept Assignment', icon: CheckCircle2, color: 'bg-emerald-600 hover:bg-emerald-700' };
      case 'accepted': return { text: 'Start Travel', icon: Play, color: 'bg-blue-600 hover:bg-blue-700' };
      case 'en_route': return { text: 'Check In at Location', icon: MapPin, color: 'bg-purple-600 hover:bg-purple-700' };
      case 'at_location': return { text: 'Mark Completed', icon: CheckCircle2, color: 'bg-emerald-600 hover:bg-emerald-700' };
      default: return { text: 'Loading...', icon: Loader2, color: 'bg-gray-600' };
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      
      {/* Current Status Banner */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex flex-col">
          <span className="text-sm text-gray-400">Current Status</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              "w-3 h-3 rounded-full animate-pulse",
              status === 'available' ? "bg-emerald-500" :
              status === 'busy' ? "bg-orange-500" :
              status === 'break' ? "bg-blue-500" : "bg-gray-500"
            )}></span>
            <span className="font-bold text-white capitalize text-lg">{status}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={status} 
            onChange={(e) => updateStatusMutation.mutate(e.target.value)}
            className="text-sm rounded-lg block p-2 border"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--green-success)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="break">On Break</option>
          </select>
        </div>
      </div>

      {/* Active Assignment Card */}
      {isLoading ? (
        <div className="flex justify-center p-10 border rounded-xl" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--green-success)' }} />
        </div>
      ) : activeAssignment ? (
        <div className="border-2 rounded-xl overflow-hidden shadow-2xl relative" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--green-success)' }}>
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: 'var(--green-success)' }}></div>
          
          <div className="p-5 border-b bg-opacity-30" style={{ borderBottomColor: 'var(--border)', backgroundColor: 'rgba(var(--surface-tertiary-rgb), 0.3)' }}>
            <div className="flex justify-between items-start mb-2">
              <span 
                className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider border"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderColor: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--green-success)',
                }}
              >Active Assignment</span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>#{activeAssignment.id.split('-')[0]}</span>
            </div>
            <h2 className="text-xl font-bold capitalize" style={{ color: 'var(--foreground)' }}>{activeAssignment.action_details.replace(/_/g, ' ')}</h2>
            {activeAssignment.incident_details && (
              <p className="text-sm mt-1 flex items-center gap-1" style={{ color: 'var(--red-incident)' }}>
                <AlertCircle className="w-4 h-4" /> 
                Related to: {activeAssignment.incident_details}
              </p>
            )}
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Location</span>
                <div className="flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  <MapPin className="w-4 h-4" style={{ color: 'var(--green-success)' }} />
                  <span className="font-medium">
                    {nodes.find((n: any) => n.id === activeAssignment.location_node_id)?.name || activeAssignment.location_node_id || "Unassigned"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Priority</span>
                <div className="flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  <AlertCircle className="w-4 h-4" style={{ color: 'var(--amber-warning)' }} />
                  <span className="font-medium capitalize">{activeAssignment.priority}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleNextStep}
              disabled={updateAssignmentMutation.isPending}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all mt-4 shadow-lg",
                getStepButtonProps(activeAssignment.status).color,
                updateAssignmentMutation.isPending && "opacity-50 cursor-not-allowed"
              )}
            >
              {updateAssignmentMutation.isPending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                React.createElement(getStepButtonProps(activeAssignment.status).icon, { className: "w-6 h-6" })
              )}
              {getStepButtonProps(activeAssignment.status).text}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <RefreshCw className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Active Assignments</h3>
          <p className="text-gray-400 text-sm max-w-xs">You currently have no tasks assigned. Stay alert and keep your status updated.</p>
        </div>
      )}

      {/* Quick Actions */}
      <h3 className="font-bold uppercase tracking-wider text-xs px-2 mt-4" style={{ color: 'var(--text-secondary)' }}>Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setShowIncidentModal(true)}
          className="border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.2)',
            color: 'var(--red-incident)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          }}
        >
          <ShieldAlert className="w-8 h-8" />
          <span className="font-bold text-sm">Report Incident</span>
        </button>
        
        <button 
          onClick={() => {
            // Check in locally, maybe updates context
            setLocation(activeAssignment?.location_node_id || "gate-a");
            alert("Checked into nearby zone");
          }}
          className="bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-colors text-emerald-500"
        >
          <MapPin className="w-8 h-8" />
          <span className="font-bold text-sm">Update Location</span>
        </button>
      </div>

      {/* Incident Modal */}
      {showIncidentModal && (
        <IncidentModal onClose={() => setShowIncidentModal(false)} />
      )}
    </div>
  );
}

function IncidentModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState('medical_emergency');
  const [node, setNode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Fetch twin nodes
  const { data: twinData } = useQuery({
    queryKey: ['twin-nodes', 'metlife'],
    queryFn: async () => {
      const res = await api.get('/venues/metlife/twin');
      return res.data;
    }
  });

  const nodes = twinData?.nodes || [];

  useEffect(() => {
    if (nodes.length > 0 && !node) {
      setNode(nodes[0].id);
    }
  }, [nodes, node]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!node) return;
      await api.post('/volunteers/incidents', {
        incident_type: type,
        severity: 'high',
        node_id: node
      });
    },
    onSuccess: () => {
      alert('Incident reported successfully.');
      onClose();
    }
  });

  const filteredNodes = nodes.filter((n: any) =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.node_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedNodeObj = nodes.find((n: any) => n.id === node);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-red-900/20 rounded-t-2xl">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold">Report Incident</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Type of Incident</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white text-sm focus:ring-red-500 focus:border-red-500"
            >
              <option value="medical_emergency">Medical Emergency</option>
              <option value="crowd_congestion">Crowd Congestion</option>
              <option value="security_issue">Security Issue</option>
              <option value="equipment_failure">Equipment Failure</option>
            </select>
          </div>
          
          <div className="relative">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Location Node</label>
            <div 
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white text-sm focus:ring-red-500 focus:border-red-500 cursor-pointer flex justify-between items-center"
            >
              <span className="truncate">{selectedNodeObj ? `${selectedNodeObj.name} (${selectedNodeObj.node_type})` : 'Select a node...'}</span>
              <span className="text-gray-500 text-xs">▼</span>
            </div>
            
            {isOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
                <input 
                  type="text" 
                  placeholder="Search node..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  className="w-full bg-gray-950 border border-gray-700 rounded p-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-red-500"
                  autoFocus
                />
                <div className="flex flex-col gap-0.5 mt-1 overflow-y-auto max-h-40">
                  {filteredNodes.map((n: any) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setNode(n.id);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded text-xs transition-colors hover:bg-gray-800",
                        node === n.id ? "bg-red-950/40 text-red-400 font-bold border border-red-900/30" : "text-gray-300"
                      )}
                    >
                      {n.name} <span className="text-[10px] text-gray-500 uppercase">({n.node_type})</span>
                    </button>
                  ))}
                  {filteredNodes.length === 0 && (
                    <span className="text-gray-500 text-xs p-2 text-center">No nodes found</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => mutate()}
            disabled={isPending || !node}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 shadow-lg shadow-red-900/20 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertCircle className="w-5 h-5" />}
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
