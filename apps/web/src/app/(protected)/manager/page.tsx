import React from 'react';
import { HealthPanel } from '../../../components/domain/HealthPanel';
import { DigitalTwinView } from '../../../components/digital-twin/DigitalTwinView';
import { NotificationSystem } from '../../../components/domain/NotificationSystem';

export default function OperationsDashboard() {
  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Operations Command Center</h1>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Health Panel & Notifications spanning 2 cols on desktop */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <HealthPanel />
          <div className="flex-1 min-h-[400px] relative rounded-xl border border-gray-800 overflow-hidden bg-gray-950">
             <div className="p-4 border-b border-gray-800 bg-gray-900">
               <h3 className="font-semibold text-white">Live Overview</h3>
             </div>
             <DigitalTwinView compact={true} />
          </div>
        </div>

        {/* Notifications Sidebar */}
        <div className="xl:col-span-1 rounded-xl border border-gray-800 bg-gray-900/50 p-6 shadow-sm backdrop-blur-sm flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">Recent Incidents</h3>
          <div className="flex-1 overflow-y-auto">
            <NotificationSystem />
          </div>
        </div>

      </div>
    </div>
  );
}
