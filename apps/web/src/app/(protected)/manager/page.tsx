import React from 'react';
import { HealthPanel } from '../../../components/domain/HealthPanel';
import { DigitalTwinView } from '../../../components/digital-twin/DigitalTwinView';
import { NotificationSystem } from '../../../components/domain/NotificationSystem';

export default function OperationsDashboard() {
  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Operations Command Center</h1>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Health Panel & Notifications spanning 2 cols on desktop */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <HealthPanel />
          <div 
            className="flex-1 min-h-[400px] relative rounded-lg border overflow-hidden flex flex-col"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <div 
              className="p-4 border-b"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderBottomColor: 'var(--border-subtle)',
              }}
            >
              <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Live Overview</h3>
            </div>
            <DigitalTwinView compact={true} />
          </div>
        </div>

        {/* Incidents Sidebar */}
        <div 
          className="xl:col-span-1 rounded-lg p-6 border flex flex-col gap-4"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Recent Incidents</h3>
          <div className="flex-1 overflow-y-auto">
            <NotificationSystem />
          </div>
        </div>

      </div>
    </div>
  );
}
