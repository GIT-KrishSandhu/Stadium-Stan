import asyncio
import json
import os

class EventBus:
    def __init__(self):
        # We use a dict of lists of asyncio.Queue to support multiple concurrent topic consumers
        self._queues = {}
        self.use_redis = os.getenv("USE_REDIS", "false").lower() == "true"
        
        if self.use_redis:
            # Placeholder for actual redis-py connection
            pass

    async def publish_event(self, topic: str, event_type: str, payload: dict):
        event = {
            "topic": topic,
            "event_type": event_type,
            "payload": payload
        }
        
        if self.use_redis:
            # e.g., await redis.xadd(topic, {"data": json.dumps(event)})
            pass
        else:
            if topic in self._queues:
                for q in self._queues[topic]:
                    await q.put(event)

    def consume_events(self, topic: str):
        """Async generator yielding events as they arrive."""
        if self.use_redis:
            # Real redis XREAD loop here
            async def redis_generator():
                # Placeholder generator
                yield {}
            return redis_generator()
        else:
            q = asyncio.Queue()
            if topic not in self._queues:
                self._queues[topic] = []
            self._queues[topic].append(q)
            
            async def generator():
                try:
                    while True:
                        event = await q.get()
                        yield event
                finally:
                    # Clean up subscription when generator is closed
                    if topic in self._queues and q in self._queues[topic]:
                        self._queues[topic].remove(q)
            return generator()

# Global singleton
event_bus = EventBus()

