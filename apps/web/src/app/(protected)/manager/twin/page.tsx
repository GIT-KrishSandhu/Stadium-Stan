import React from 'react';
import { DigitalTwinView } from '../../../../components/digital-twin/DigitalTwinView';

export default function TwinWorkspace() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Digital Twin Workspace</h1>
      </div>
      <div className="flex-1 relative">
        <DigitalTwinView />
      </div>
    </div>
  );
}
