'use client';
import React from 'react';
import { SimulationComparison } from '../../../../components/digital-twin/drawer/SimulationComparison';
import { useSelectionStore } from '../../../../stores/selectionStore';
import { useAppStore } from '../../../../stores/appStore';
import Link from 'next/link';

export default function SimulationPage() {
  const { selectedNodeId } = useSelectionStore();
  const { venueId } = useAppStore();

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Simulation Preview</h1>
      </div>
      
      {!selectedNodeId ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50">
          <h2 className="text-xl font-bold text-gray-300 mb-2">No Context Selected</h2>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Simulations are run in the context of specific gates, sections, or resources. Please select a node from the Digital Twin to run and view a simulation.
          </p>
          <Link href="/manager/twin" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors">
            Go to Digital Twin
          </Link>
        </div>
      ) : (
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
           <h3 className="text-lg font-bold text-white mb-4">Node Context: {selectedNodeId}</h3>
           <SimulationComparison 
             venueId={venueId}
             nodeId={selectedNodeId}
             currentOccupancy={1000} // Mock defaults if context missing
             currentRisk={0.5}
           />
        </div>
      )}
    </div>
  );
}
