import { useWebSocketStore } from '../stores/wsStore';

// We implement a foundational reconnecting WebSocket client.
// This is currently a shell since we are not implementing Digital Twin yet.
class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private baseDelay = 1000;
  private maxDelay = 30000;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/venues';
  }

  connect(venueId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(`${this.url}/${venueId}`);

      this.ws.onopen = () => {
        useWebSocketStore.getState().setConnected(true);
        useWebSocketStore.getState().resetReconnect();
        console.log(`[WS] Connected to venue: ${venueId}`);
      };

      this.ws.onmessage = (event) => {
        useWebSocketStore.getState().recordMessage();
        try {
          const data = JSON.parse(event.data);
          console.debug('[WS] Message received:', data);
          
          if (data.type === 'TWIN_UPDATED' && data.node) {
            const updates: any = {};
            if (data.occupancy !== undefined) updates.occupancy = data.occupancy;
            if (data.status !== undefined) updates.status = data.status;
            if (data.incident_severity !== undefined) updates.incidentSeverity = data.incident_severity;
            
            import('../stores/graphStore').then(({ useGraphStore }) => {
              useGraphStore.getState().updateNodeData(data.node, updates);
            });
          }

          if (data.type === 'EXECUTION_COMPLETED') {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('EXECUTION_COMPLETED', { detail: data }));
            }
            import('../stores/notificationStore').then(({ useNotificationStore }) => {
              useNotificationStore.getState().addNotification({
                role: 'manager',
                type: 'execution',
                severity: 'success',
                priority: 'normal',
                title: 'Execution Completed',
                message: `Action executed successfully on ${data.node}`
              });
            });
          }
          
          if (data.type === 'RISK_UPDATED') {
            const match = data.risk.match(/at ([a-zA-Z0-9-]+) \(score: ([0-9.]+)\)/);
            if (match) {
              const nodeId = match[1];
              const score = parseFloat(match[2]);
              import('../stores/graphStore').then(({ useGraphStore }) => {
                useGraphStore.getState().updateNodeData(nodeId, { riskScore: score });
              });
              
              if (score > 0.8) {
                import('../stores/notificationStore').then(({ useNotificationStore }) => {
                  useNotificationStore.getState().addNotification({
                    role: 'manager',
                    type: 'operational',
                    severity: 'warning',
                    priority: 'high',
                    title: 'High Risk Detected',
                    message: data.risk
                  });
                });
              }
            }
          }

          if (data.type === 'VOLUNTEER_EVENT') {
            const wsEvent = data.event;
            const payload = wsEvent.payload;
            import('../stores/notificationStore').then(({ useNotificationStore }) => {
              if (wsEvent.event_type === 'NEW_ASSIGNMENT') {
                useNotificationStore.getState().addNotification({
                  role: 'volunteer',
                  type: 'operational',
                  severity: 'warning',
                  priority: 'high',
                  title: 'New Incident Assignment',
                  message: `You have been dispatched to handle an active incident. Please accept.`,
                  deepLink: '/volunteer'
                });
                useNotificationStore.getState().addNotification({
                  role: 'manager',
                  type: 'execution',
                  severity: 'info',
                  priority: 'normal',
                  title: 'Volunteer Dispatched',
                  message: `Volunteer dispatched to incident location.`,
                  deepLink: '/manager/history'
                });
              } else if (wsEvent.event_type === 'ASSIGNMENT_STATUS_CHANGED') {
                const status = payload.status;
                const nodeLabel = payload.location_node_id || 'incident node';
                
                let statusText = status;
                if (status === 'accepted') statusText = 'accepted assignment';
                if (status === 'en_route') statusText = 'is en route';
                if (status === 'at_location') statusText = 'has checked in at location';
                if (status === 'completed') statusText = 'completed assignment';
                
                useNotificationStore.getState().addNotification({
                  role: 'manager',
                  type: 'execution',
                  severity: status === 'completed' ? 'success' : 'info',
                  priority: 'normal',
                  title: 'Task Status Updated',
                  message: `Volunteer ${statusText} at ${nodeLabel}.`,
                  deepLink: '/manager/history'
                });
                
                if (status === 'accepted') {
                  useNotificationStore.getState().addNotification({
                    role: 'fan',
                    type: 'operational',
                    severity: 'info',
                    priority: 'high',
                    title: 'Assistance Dispatched',
                    message: `A volunteer is responding to your assistance request.`,
                    deepLink: '/fan'
                  });
                } else if (status === 'en_route') {
                  useNotificationStore.getState().addNotification({
                    role: 'fan',
                    type: 'operational',
                    severity: 'info',
                    priority: 'normal',
                    title: 'Volunteer En Route',
                    message: `The assigned responder is currently traveling to your location.`,
                    deepLink: '/fan'
                  });
                } else if (status === 'at_location') {
                  useNotificationStore.getState().addNotification({
                    role: 'fan',
                    type: 'operational',
                    severity: 'warning',
                    priority: 'high',
                    title: 'Responder Arrived',
                    message: `The responder has arrived at your location.`,
                    deepLink: '/fan'
                  });
                }
              }
            });
          }

          if (data.type === 'INCIDENT_EVENT') {
            const wsEvent = data.event;
            const payload = wsEvent.payload;
            import('../stores/notificationStore').then(({ useNotificationStore }) => {
              if (wsEvent.event_type === 'INCIDENT_REPORTED') {
                useNotificationStore.getState().addNotification({
                  role: 'manager',
                  type: 'operational',
                  severity: 'error',
                  priority: 'critical',
                  title: 'Critical Incident Reported',
                  message: `New incident reported: ${payload.type.replace(/_/g, ' ')} at Node: ${payload.node_id}.`,
                  deepLink: '/manager/incidents'
                });
              } else if (wsEvent.event_type === 'INCIDENT_RESOLVED') {
                useNotificationStore.getState().addNotification({
                  role: 'manager',
                  type: 'operational',
                  severity: 'success',
                  priority: 'normal',
                  title: 'Incident Resolved',
                  message: `Incident resolved successfully.`,
                  deepLink: '/manager/incidents'
                });
                useNotificationStore.getState().addNotification({
                  role: 'fan',
                  type: 'execution',
                  severity: 'success',
                  priority: 'high',
                  title: 'Request Resolved',
                  message: `Your assistance request has been successfully resolved.`,
                  deepLink: '/fan'
                });
              }
            });
          }

          if (data.type === 'RECOMMENDATION_CREATED') {
            import('../stores/notificationStore').then(({ useNotificationStore }) => {
              useNotificationStore.getState().addNotification({
                role: 'manager',
                type: 'simulation',
                severity: 'info',
                priority: 'high',
                title: 'AI Recommendation Ready',
                message: data.summary || 'A new response action recommendation has been generated.',
                deepLink: '/manager/twin'
              });
            });
          }

          if (data.type === 'VOLUNTEER_EVENT' || data.type === 'INCIDENT_EVENT' || data.type === 'RECOMMENDATION_CREATED') {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('SYNC_REQUIRED', { detail: data }));
            }
          }
        } catch (e) {
          console.error('[WS] Failed to parse message', e);
        }
      };

      this.ws.onclose = () => {
        const wasConnected = useWebSocketStore.getState().isConnected;
        useWebSocketStore.getState().setConnected(false);
        if (wasConnected) {
          import('../stores/notificationStore').then(({ useNotificationStore }) => {
            const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
            const role = pathname.includes('/manager') ? 'manager' : pathname.includes('/volunteer') ? 'volunteer' : 'fan';
            
            useNotificationStore.getState().addNotification({
              role: role as any,
              type: 'connection',
              severity: 'error',
              priority: 'high',
              title: 'Connection Lost',
              message: 'Live telemetry stream disconnected. Attempting to reconnect...'
            });
          });
        }
        this.scheduleReconnect(venueId);
      };

      this.ws.onerror = (error) => {
        console.error('[WS] Error:', error);
        // onclose will be called after onerror usually, which handles reconnect
      };
    } catch (e) {
      console.error('[WS] Initialization failed:', e);
      this.scheduleReconnect(venueId);
    }
  }

  private scheduleReconnect(venueId: string) {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    const attempts = useWebSocketStore.getState().reconnectAttempts;
    const delay = Math.min(this.baseDelay * Math.pow(2, attempts), this.maxDelay);
    
    useWebSocketStore.getState().incrementReconnect();
    
    console.log(`[WS] Reconnecting in ${delay}ms (Attempt ${attempts + 1})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect(venueId);
    }, delay);
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('[WS] Cannot send message, disconnected');
    }
  }
}

export const wsClient = new WebSocketClient();
