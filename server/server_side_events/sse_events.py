import asyncio
import json
from typing import Set

# Shared event queue where producers (like YOLO image detection) push verification payload events
event_queue: asyncio.Queue = asyncio.Queue()

# Set of active subscriber queues (one for each connected SSE client)
sse_subscribers: Set[asyncio.Queue] = set()


async def dispatch_events():
    """
    Continuously listens for events from event_queue and broadcasts each event 
    to all active client subscriber queues.
    """
    while True:
        try:
            event_data = await event_queue.get()
            subscribers = list(sse_subscribers)
            for subscriber in subscribers:
                try:
                    subscriber.put_nowait(event_data)
                except Exception as e:
                    print(f"[SSE Dispatch Warning]: Failed to put event to subscriber: {e}")
        except Exception as e:
            print(f"[SSE Dispatch Loop Error]: {e}")