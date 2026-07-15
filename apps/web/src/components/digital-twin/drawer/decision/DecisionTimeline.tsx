import React from 'react';
import { History, User } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export function DecisionTimeline({ timeline }: { timeline: any[] }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <History className="w-3 h-3" /> Decision Timeline
      </h3>
      <ol className="relative border-l border-gray-700 ml-2">
        {timeline.map((event, idx) => (
          <li key={idx} className="mb-4 ml-4">
            <div className={cn(
              "absolute w-2 h-2 rounded-full -left-1",
              event.event_type === 'APPROVED' ? 'bg-emerald-500' :
              event.event_type === 'REJECTED' ? 'bg-red-500' :
              event.event_type === 'MODIFIED' ? 'bg-blue-500' : 'bg-gray-500'
            )}></div>
            <time className="mb-1 text-[10px] font-normal leading-none text-gray-500 uppercase tracking-wider flex items-center gap-2">
              {new Date(event.timestamp).toLocaleString()}
              <span className="flex items-center gap-1 bg-gray-800 px-1.5 py-0.5 rounded text-gray-400"><User className="w-2.5 h-2.5" /> {event.actor}</span>
            </time>
            <h4 className="text-xs font-bold text-white mt-1">{event.event_type}</h4>
            
            {event.event_type === 'MODIFIED' && event.old_value && event.new_value && (
              <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400 p-2 bg-gray-900 rounded border border-gray-800">
                <span className="line-through">{event.old_value}</span>
                <span className="text-blue-500">→</span>
                <span className="text-blue-400 font-bold">{event.new_value}</span>
              </div>
            )}
            
            {event.notes && (
              <p className="mt-1 text-xs font-normal text-gray-400 italic">{event.notes}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
